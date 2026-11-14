const fs = require('fs');
const path = require('path');

function createAsar(srcDir, destFile) {
  const filesList = [];
  function walk(dir, rel) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const relPath = rel ? rel + '/' + ent.name : ent.name;
      if (ent.isDirectory()) {
        walk(full, relPath);
      } else {
        filesList.push({ full, relPath, size: fs.statSync(full).size });
      }
    }
  }
  walk(srcDir, '');

  const root = { files: {} };
  let currentOffset = 0;
  for (const f of filesList) {
    const parts = f.relPath.split('/');
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur.files[parts[i]]) cur.files[parts[i]] = { files: {} };
      cur = cur.files[parts[i]];
    }
    const fileName = parts[parts.length - 1];
    cur.files[fileName] = {
      size: f.size,
      offset: currentOffset.toString()
    };
    currentOffset += f.size;
  }

  const jsonStr = JSON.stringify(root);
  const jsonBuf = Buffer.from(jsonStr, 'utf8');
  const jsonSize = jsonBuf.length;

  // Header alignment: 4-byte aligned
  const headerBufSize = 16 + jsonSize;
  const padding = (4 - (headerBufSize % 4)) % 4;
  const totalHeaderSize = headerBufSize + padding;

  const header = Buffer.alloc(totalHeaderSize);
  header.writeUInt32LE(4, 0);
  header.writeUInt32LE(totalHeaderSize - 8, 4);
  header.writeUInt32LE(totalHeaderSize - 12, 8);
  header.writeUInt32LE(jsonSize, 12);
  jsonBuf.copy(header, 16);

  const out = fs.openSync(destFile, 'w');
  fs.writeSync(out, header);
  for (const f of filesList) {
    const data = fs.readFileSync(f.full);
    fs.writeSync(out, data);
  }
  fs.closeSync(out);
  console.log('Successfully created asar:', destFile, 'Total size:', fs.statSync(destFile).size);
}

// 1. Copy fresh files to SonarStudio-App/resources/app
const appDir = path.join(__dirname, '..', 'SonarStudio-App', 'resources', 'app');
const rootDir = path.join(__dirname, '..');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const ent of entries) {
    const srcPath = path.join(src, ent.name);
    const destPath = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Syncing dist, electron, and package.json to app directory...');
copyDirSync(path.join(rootDir, 'dist'), path.join(appDir, 'dist'));
copyDirSync(path.join(rootDir, 'electron'), path.join(appDir, 'electron'));
copyDirSync(path.join(rootDir, 'build'), path.join(appDir, 'build'));
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(appDir, 'package.json'));

// 2. Build asar
const asarTarget = path.join(rootDir, 'SonarStudio-App', 'resources', 'app.asar');
const asarNew = path.join(rootDir, 'SonarStudio-App', 'resources', 'app.asar.new');

createAsar(appDir, asarNew);

// 3. Replace app.asar with retry
try {
  fs.copyFileSync(asarNew, asarTarget);
  fs.unlinkSync(asarNew);
  console.log('Updated app.asar successfully!');
} catch (err) {
  console.warn('Could not overwrite app.asar directly (it might be in use):', err.message);
  console.log('app.asar.new is ready, and unpacked resources/app directory is fully updated.');
}


const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const licenseManager = require('./licenseManager');

function setupMacMenu() {
  if (process.platform !== 'darwin') return;
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

let mainWindow;
let activeFolderWatcher = null;
let watcherDebounceTimer = null;
let currentWatchedPath = null;

function stopFolderWatcher() {
  if (activeFolderWatcher) {
    try {
      activeFolderWatcher.close();
    } catch (e) { }
    activeFolderWatcher = null;
  }
  if (watcherDebounceTimer) {
    clearTimeout(watcherDebounceTimer);
    watcherDebounceTimer = null;
  }
  currentWatchedPath = null;
}

function startFolderWatcher(folderPath) {
  stopFolderWatcher();
  if (!folderPath || !fs.existsSync(folderPath)) return;

  currentWatchedPath = folderPath;

  try {
    activeFolderWatcher = fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
      // Debounce because file writing / folder creation triggers multiple rapid events
      if (watcherDebounceTimer) clearTimeout(watcherDebounceTimer);
      watcherDebounceTimer = setTimeout(() => {
        if (!mainWindow || mainWindow.isDestroyed() || !currentWatchedPath) return;
        try {
          const freshData = scanFolderForPatients(currentWatchedPath);
          mainWindow.webContents.send('folder:updated', freshData);
        } catch (err) {
          console.error('Error during auto-refresh of watched folder:', err);
        }
      }, 400);
    });

    activeFolderWatcher.on('error', (err) => {
      console.warn('Folder watcher error:', err);
      stopFolderWatcher();
    });
  } catch (err) {
    console.warn('Could not start fs.watch:', err);
  }
}

function createWindow() {
  const possibleIcons = [
    path.join(__dirname, '../build/icon.png'),
    path.join(__dirname, '../build/icon.ico'),
    path.join(__dirname, '../dist/icon.png'),
    path.join(process.resourcesPath || '', 'app/build/icon.png'),
    path.join(process.resourcesPath || '', 'build/icon.png')
  ];
  const iconPath = possibleIcons.find(p => fs.existsSync(p));
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1050,
    minHeight: 700,
    backgroundColor: '#0f172a',
    title: 'Printify - برنامج تجهيز وطباعة صور السونار والتقارير الطبية',
    icon: iconPath,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.on('closed', () => {
    stopFolderWatcher();
    mainWindow = null;
  });
}

// IPC Handlers
function scanFolderForPatients(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return { success: false, error: 'Folder does not exist' };
  }
  const folderName = path.basename(folderPath);
  const supportedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff']);

  const parseImageFile = (filePath) => {
    const filename = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExts.has(ext)) return null;

    let mime = 'image/jpeg';
    if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.bmp') mime = 'image/bmp';

    try {
      let fileTime = Date.now();
      let fileSize = 0;
      try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
        fileTime = Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0, stats.ctimeMs || 0);
      } catch (e) {
        fileTime = Date.now();
      }

      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      return {
        id: 'img_' + Math.random().toString(36).substring(2, 9),
        name: filename,
        path: filePath,
        url: `data:${mime};base64,${base64Data}`,
        size: fileSize || fileBuffer.length,
        rotation: 0,
        tag: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        timestamp: fileTime,
        mtimeMs: fileTime
      };
    } catch (err) {
      console.error('Error reading image file:', filePath, err);
      return null;
    }
  };

  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const subDirs = entries.filter((e) => e.isDirectory());
    const rootFiles = entries.filter((e) => e.isFile());

    const patients = [];

    // 1. Check each subdirectory as a patient folder (e.g. patient1, patient2...)
    for (const subDir of subDirs) {
      const subDirPath = path.join(folderPath, subDir.name);
      try {
        let folderTime = 0;
        try {
          const folderStat = fs.statSync(subDirPath);
          folderTime = Math.max(folderStat.mtimeMs || 0, folderStat.birthtimeMs || 0, folderStat.ctimeMs || 0);
        } catch (e) { }

        const subFiles = fs.readdirSync(subDirPath, { withFileTypes: true });
        const images = [];
        for (const file of subFiles) {
          if (file.isFile()) {
            const parsed = parseImageFile(path.join(subDirPath, file.name));
            if (parsed) images.push(parsed);
          }
        }

        // Sort images inside patient subfolder: newest first (المضاف حديثاً أولاً)
        images.sort((a, b) => {
          const diff = (b.timestamp || 0) - (a.timestamp || 0);
          if (Math.abs(diff) > 50) return diff;
          return b.name.localeCompare(a.name, undefined, { numeric: true });
        });

        // Patient timestamp: latest of folder modification/creation or any of its scans
        const latestImageTime = images.length > 0 ? (images[0].timestamp || 0) : 0;
        const effectiveTime = Math.max(folderTime, latestImageTime);

        patients.push({
          id: 'patient_' + Math.random().toString(36).substring(2, 9),
          folderName: subDir.name,
          patientName: subDir.name.replace(/[-_]/g, ' '),
          path: subDirPath,
          images,
          timestamp: effectiveTime,
          mtimeMs: effectiveTime
        });
      } catch (err) {
        console.error('Error reading subfolder:', subDirPath, err);
      }
    }

    // 2. Check root files
    const rootImages = [];
    for (const file of rootFiles) {
      const parsed = parseImageFile(path.join(folderPath, file.name));
      if (parsed) rootImages.push(parsed);
    }

    if (rootImages.length > 0) {
      rootImages.sort((a, b) => {
        const diff = (b.timestamp || 0) - (a.timestamp || 0);
        if (Math.abs(diff) > 50) return diff;
        return b.name.localeCompare(a.name, undefined, { numeric: true });
      });

      let rootFolderTime = 0;
      try {
        const rootStat = fs.statSync(folderPath);
        rootFolderTime = Math.max(rootStat.mtimeMs || 0, rootStat.birthtimeMs || 0, rootStat.ctimeMs || 0);
      } catch (e) { }
      const latestRootImgTime = rootImages.length > 0 ? (rootImages[0].timestamp || 0) : 0;
      const effectiveRootTime = Math.max(rootFolderTime, latestRootImgTime);

      patients.push({
        id: 'patient_root_' + Math.random().toString(36).substring(2, 9),
        folderName: folderName,
        patientName: folderName.replace(/[-_]/g, ' '),
        path: folderPath,
        images: rootImages,
        timestamp: effectiveRootTime,
        mtimeMs: effectiveRootTime
      });
    }

    if (patients.length === 0) {
      patients.push({
        id: 'patient_root_' + Math.random().toString(36).substring(2, 9),
        folderName: folderName,
        patientName: folderName.replace(/[-_]/g, ' '),
        path: folderPath,
        images: [],
        timestamp: Date.now(),
        mtimeMs: Date.now()
      });
    }

    // Sort patients descending: Most recently added / modified FIRST (المضاف حديثاً بالأعلى)
    patients.sort((a, b) => {
      const timeDiff = (b.timestamp || 0) - (a.timestamp || 0);
      if (Math.abs(timeDiff) > 50) return timeDiff;
      // If timestamps are identical or very close, sort natural reverse (e.g. patient3 before patient2 before patient1)
      return b.folderName.localeCompare(a.folderName, undefined, { numeric: true, sensitivity: 'base' });
    });

    return {
      success: true,
      folderPath,
      folderName,
      patients
    };
  } catch (err) {
    console.error('Error scanning folder:', err);
    return { success: false, error: err.message };
  }
}

ipcMain.handle('dialog:open-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'استدعاء مجلد صور وفحوصات السونار',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }
  const folderPath = result.filePaths[0];
  startFolderWatcher(folderPath);
  return scanFolderForPatients(folderPath);
});

ipcMain.handle('folder:reload', async (event, folderPath) => {
  if (!folderPath) return null;
  startFolderWatcher(folderPath);
  return scanFolderForPatients(folderPath);
});

ipcMain.handle('folder:close', async () => {
  stopFolderWatcher();
  return { success: true };
});

ipcMain.handle('dialog:open-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'اختر صور السونار المطلوبة',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Ultrasound Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return [];
  }

  const filesData = result.filePaths.map((filePath) => {
    const filename = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let mime = 'image/jpeg';
    if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.bmp') mime = 'image/bmp';

    try {
      let fileTime = Date.now();
      let fileSize = 0;
      try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
        fileTime = Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0, stats.ctimeMs || 0);
      } catch (e) {
        fileTime = Date.now();
      }

      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64Data}`;
      return {
        id: 'img_' + Math.random().toString(36).substring(2, 9),
        name: filename,
        path: filePath,
        url: dataUrl,
        size: fileSize || fileBuffer.length,
        timestamp: fileTime,
        mtimeMs: fileTime
      };
    } catch (err) {
      console.error('Error reading file:', filePath, err);
      return null;
    }
  }).filter(Boolean);

  // Sort files descending: newest first
  filesData.sort((a, b) => {
    const diff = (b.timestamp || 0) - (a.timestamp || 0);
    if (Math.abs(diff) > 50) return diff;
    return b.name.localeCompare(a.name, undefined, { numeric: true });
  });

  return filesData;
});

// IPC Handler to fetch available system printers
ipcMain.handle('printers:get', async () => {
  if (!mainWindow) return [];
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers || [];
  } catch (error) {
    console.error('Failed to get printers:', error);
    return [];
  }
});

ipcMain.handle('print:direct', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    const printOptions = {
      silent: options.silent ?? (options.deviceName ? true : false),
      printBackground: true,
      color: options.color !== false,
      margins: {
        marginType: 'none'
      },
      landscape: options.landscape || false,
      pageSize: options.pageSize || 'A4',
      copies: options.copies || 1
    };

    if (options.deviceName) {
      printOptions.deviceName = options.deviceName;
    }

    mainWindow.webContents.print(printOptions, (success, failureReason) => {
      if (!success) console.log('Print cancelled/failed:', failureReason);
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:to-pdf', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    const isLandscape = options.landscape === true;
    const pageSize = options.pageSize || 'A4';

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'حفظ تقرير السونار كملف PDF',
      defaultPath: `Ultrasound_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });

    if (!filePath) return { canceled: true };

    const pdfData = await mainWindow.webContents.printToPDF({
      printBackground: true,
      landscape: isLandscape,
      pageSize: pageSize,
      margins: {
        marginType: 'none'
      }
    });

    fs.writeFileSync(filePath, pdfData);
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==========================================
// License & Software Protection IPC Handlers
// ==========================================
ipcMain.handle('license:get-status', async () => {
  return licenseManager.getLicenseStatus(app);
});

ipcMain.handle('license:get-machine-id', async () => {
  return licenseManager.getMachineId();
});

ipcMain.handle('license:activate', async (_event, { activationKey, clientName }) => {
  return licenseManager.activateLicense(app, activationKey, clientName);
});

ipcMain.handle('license:deactivate', async () => {
  return licenseManager.deactivateLicense(app);
});

app.whenReady().then(() => {
  setupMacMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

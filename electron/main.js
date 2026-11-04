const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1050,
    minHeight: 700,
    backgroundColor: '#0f172a',
    title: 'برنامج تجهيز وطباعة صور السونار - Sonar Print Studio',
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
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      return {
        id: 'img_' + Math.random().toString(36).substring(2, 9),
        name: filename,
        path: filePath,
        url: `data:${mime};base64,${base64Data}`,
        size: fileBuffer.length,
        rotation: 0,
        tag: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        timestamp: Date.now()
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
        const subFiles = fs.readdirSync(subDirPath, { withFileTypes: true });
        const images = [];
        for (const file of subFiles) {
          if (file.isFile()) {
            const parsed = parseImageFile(path.join(subDirPath, file.name));
            if (parsed) images.push(parsed);
          }
        }
        patients.push({
          id: 'patient_' + Math.random().toString(36).substring(2, 9),
          folderName: subDir.name,
          patientName: subDir.name.replace(/[-_]/g, ' '),
          path: subDirPath,
          images
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

    if (rootImages.length > 0 || patients.length === 0) {
      patients.unshift({
        id: 'patient_root_' + Math.random().toString(36).substring(2, 9),
        folderName: folderName,
        patientName: folderName.replace(/[-_]/g, ' '),
        path: folderPath,
        images: rootImages
      });
    }

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
  return scanFolderForPatients(result.filePaths[0]);
});

ipcMain.handle('folder:reload', async (event, folderPath) => {
  if (!folderPath) return null;
  return scanFolderForPatients(folderPath);
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
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64Data}`;
      return {
        id: 'img_' + Math.random().toString(36).substring(2, 9),
        name: filename,
        path: filePath,
        url: dataUrl,
        size: fileBuffer.length,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error reading file:', filePath, err);
      return null;
    }
  }).filter(Boolean);

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

app.whenReady().then(createWindow);

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

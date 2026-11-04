const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:open-files'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:open-folder'),
  reloadFolder: (folderPath) => ipcRenderer.invoke('folder:reload', folderPath),
  directPrint: (options) => ipcRenderer.invoke('print:direct', options),
  getPrinters: () => ipcRenderer.invoke('printers:get'),
  savePdf: () => ipcRenderer.invoke('print:to-pdf'),
  isElectron: true
});

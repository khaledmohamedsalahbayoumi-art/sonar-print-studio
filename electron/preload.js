const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:open-files'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:open-folder'),
  reloadFolder: (folderPath) => ipcRenderer.invoke('folder:reload', folderPath),
  closeFolder: () => ipcRenderer.invoke('folder:close'),
  onFolderUpdated: (callback) => {
    const subscription = (_event, data) => callback(data);
    ipcRenderer.on('folder:updated', subscription);
    return () => ipcRenderer.removeListener('folder:updated', subscription);
  },
  directPrint: (options) => ipcRenderer.invoke('print:direct', options),
  getPrinters: () => ipcRenderer.invoke('printers:get'),
  savePdf: (options) => ipcRenderer.invoke('print:to-pdf', options),
  isElectron: true
});

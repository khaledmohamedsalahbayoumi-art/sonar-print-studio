const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:open-files'),
  directPrint: (options) => ipcRenderer.invoke('print:direct', options),
  getPrinters: () => ipcRenderer.invoke('printers:get'),
  savePdf: () => ipcRenderer.invoke('print:to-pdf'),
  isElectron: true
});

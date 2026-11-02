const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:open-files'),
  directPrint: (options) => ipcRenderer.invoke('print:direct', options),
  savePdf: () => ipcRenderer.invoke('print:to-pdf'),
  isElectron: true
});

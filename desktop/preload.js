const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  openWhatsApp: (nativeUrl, webUrl) => ipcRenderer.invoke('open-whatsapp', { nativeUrl, webUrl })
});

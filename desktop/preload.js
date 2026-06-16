const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose IPC communication here in the future
  platform: process.platform
});

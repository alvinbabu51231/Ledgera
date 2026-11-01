const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow;
let backendApp;

ipcMain.handle('open-whatsapp', async (_event, { nativeUrl, webUrl }) => {
  try {
    await shell.openExternal(nativeUrl);
    return 'desktop';
  } catch {
    await shell.openExternal(webUrl);
    return 'web';
  }
});

async function startProductionBackend() {
  if (!app.isPackaged || backendApp) return;

  process.env.LEDGERA_EMBEDDED_BACKEND = '1';
  process.env.LEDGERA_DATA_DIR = path.join(app.getPath('userData'), 'database');
  process.env.COMBERP_EMBEDDED_BACKEND = '1';
  process.env.COMBERP_DATA_DIR = process.env.LEDGERA_DATA_DIR;
  const { startBackend } = require(path.join(__dirname, '../dist/backend/main.cjs'));
  backendApp = await startBackend();
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Ledgera',
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(__dirname, '../dist/frontend/index.html'));
  } else {
    await mainWindow.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(async () => {
  try {
    await startProductionBackend();
    await createWindow();
  } catch (error) {
    console.error('Application startup failed:', error);
    dialog.showErrorBox('Ledgera could not start', error instanceof Error ? error.message : String(error));
    app.quit();
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', async event => {
  if (!backendApp) return;
  event.preventDefault();
  const appToClose = backendApp;
  backendApp = null;
  await appToClose.close();
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

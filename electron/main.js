import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import * as pty from 'node-pty';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

const APP_ID = 'com.quing.terminal';
const APP_NAME = 'terminal by Quing';
const DEV_ICON_PATH = path.join(__dirname, '../src/assets/Quing Logo 512.ico');
const PACKAGED_ICON_PATH = path.join(process.resourcesPath, 'assets', 'Quing Logo 512.ico');

function createWindow() {
  const iconPath = app.isPackaged ? PACKAGED_ICON_PATH : DEV_ICON_PATH;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#151B25',
    icon: iconPath,
    title: APP_NAME,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false,
    titleBarStyle: 'hiddenInset',
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow.close());

if (process.platform === 'win32') {
  app.setAppUserModelId(APP_ID);
}

app.setName(APP_NAME);
app.whenReady().then(createWindow);

const terminals = {};

ipcMain.handle('create-terminal', (event, { id, cwd, shell, args, cols, rows }) => {
  // Kill existing terminal with same ID if it exists
  if (terminals[id]) {
    try {
      terminals[id].kill();
    } catch (e) {
      console.error('Error killing existing terminal:', e);
    }
    delete terminals[id];
  }

  const shellToUse = shell || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');
  const defaultArgs = shellToUse.toLowerCase().includes('powershell') ? ['-NoLogo'] : [];
  const spawnArgs = Array.isArray(args) ? args : defaultArgs;
  
  const terminalProcess = pty.spawn(shellToUse, spawnArgs, {
    name: 'xterm-color',
    cols: cols || 80,
    rows: rows || 24,
    cwd: cwd || os.homedir(),
    env: process.env,
  });

  terminals[id] = terminalProcess;

  terminalProcess.onData((data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(`terminal-data-${id}`, data);
    }
  });

  terminalProcess.onExit(({ exitCode, signal }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(`terminal-exit-${id}`, { exitCode, signal });
    }
    delete terminals[id];
  });

  return id;
});

ipcMain.on('terminal-write', (event, { id, data }) => {
  if (terminals[id]) {
    terminals[id].write(data);
  }
});

ipcMain.on('terminal-kill', (event, { id }) => {
  if (terminals[id]) {
    terminals[id].kill();
    delete terminals[id];
  }
});

ipcMain.on('terminal-resize', (event, { id, cols, rows }) => {
  if (terminals[id]) {
    if (cols > 0 && rows > 0) {
      terminals[id].resize(cols, rows);
    }
  }
});

const killAllTerminals = () => {
  Object.keys(terminals).forEach((key) => {
    try {
      terminals[key].kill();
    } catch (e) {
      console.error('Error killing terminal:', e);
    }
    delete terminals[key];
  });
};

app.on('before-quit', () => {
  killAllTerminals();
});

app.on('window-all-closed', () => {
  killAllTerminals();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

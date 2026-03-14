const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('terminalAPI', {
  createTerminal: (options) => ipcRenderer.invoke('create-terminal', options),
  write: (id, data) => ipcRenderer.send('terminal-write', { id, data }),
  kill: (id) => ipcRenderer.send('terminal-kill', { id }),
  resize: (id, { cols, rows }) => ipcRenderer.send('terminal-resize', { id, cols, rows }),
  onData: (id, callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(`terminal-data-${id}`, listener);
    return () => ipcRenderer.removeListener(`terminal-data-${id}`, listener);
  },
  onExit: (id, callback) => {
    const listener = (event, status) => callback(status);
    ipcRenderer.on(`terminal-exit-${id}`, listener);
    return () => ipcRenderer.removeListener(`terminal-exit-${id}`, listener);
  },
  readClipboard: () => clipboard.readText(),
  writeClipboard: (text) => clipboard.writeText(text || ''),
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});

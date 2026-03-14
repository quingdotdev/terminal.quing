/// <reference types="vite/client" />

interface TerminalAPI {
  createTerminal: (options: { id: string; cwd?: string; shell?: string; args?: string[]; cols?: number; rows?: number }) => Promise<string>;
  write: (id: string, data: string) => void;
  kill: (id: string) => void;
  resize: (id: string, size: { cols: number; rows: number }) => void;
  onData: (id: string, callback: (data: string) => void) => () => void;
  onExit: (id: string, callback: (status: { exitCode: number; signal?: string }) => void) => () => void;
  readClipboard: () => string;
  writeClipboard: (text: string) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

interface Window {
  terminalAPI: TerminalAPI;
}

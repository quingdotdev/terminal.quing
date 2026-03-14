import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import { XTERM_THEMES, type ThemeName } from '../state/themes';

export interface TerminalApi {
  focus: () => void;
  copySelection: () => string;
  pasteText: (text: string) => void;
  selectAll: () => void;
  findNext: (query: string) => boolean;
  findPrevious: (query: string) => boolean;
  clearSearch: () => void;
  getSize: () => { cols: number; rows: number };
}

interface TerminalViewProps {
  id: string;
  cwd?: string;
  shell?: string;
  args?: string[];
  theme: ThemeName;
  isActive: boolean;
  isVisible: boolean;
  onExit?: () => void;
  onReady?: (id: string, api: TerminalApi) => void;
  onDispose?: (id: string) => void;
  onActivity?: () => void;
  onSizeChange?: (size: { cols: number; rows: number }) => void;
}

const TerminalView: React.FC<TerminalViewProps> = ({
  id,
  cwd,
  shell,
  args,
  theme,
  isActive,
  isVisible,
  onExit,
  onReady,
  onDispose,
  onActivity,
  onSizeChange,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isVisibleRef = useRef<boolean>(isVisible);

  useEffect(() => {
    isVisibleRef.current = isVisible;
    if (isVisible && fitAddonRef.current && xtermRef.current) {
      fitAddonRef.current.fit();
      window.terminalAPI.resize(id, {
        cols: xtermRef.current.cols,
        rows: xtermRef.current.rows,
      });
      onSizeChange?.({ cols: xtermRef.current.cols, rows: xtermRef.current.rows });
    }
  }, [id, isVisible, onSizeChange]);

  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = XTERM_THEMES[theme];
    }
  }, [theme]);

  useEffect(() => {
    if (!terminalRef.current) return;

    let isMounted = true;
    let cleanupData: (() => void) | undefined;
    let cleanupExit: (() => void) | undefined;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace",
      theme: XTERM_THEMES[theme],
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.open(terminalRef.current);

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const api: TerminalApi = {
      focus: () => terminal.focus(),
      copySelection: () => terminal.getSelection(),
      pasteText: (text: string) => {
        if (!text) return;
        if (typeof (terminal as any).paste === 'function') {
          (terminal as any).paste(text);
        } else {
          terminal.write(text);
        }
      },
      selectAll: () => terminal.selectAll(),
      findNext: (query: string) => searchAddon.findNext(query),
      findPrevious: (query: string) => searchAddon.findPrevious(query),
      clearSearch: () => {
        if (typeof (searchAddon as any).clearSearch === 'function') {
          (searchAddon as any).clearSearch();
        }
      },
      getSize: () => ({ cols: terminal.cols, rows: terminal.rows }),
    };

    onReady?.(id, api);

    const initTerminal = async () => {
      requestAnimationFrame(() => {
        if (!isMounted) return;
        if (isVisibleRef.current) {
          fitAddon.fit();
        }
        window.terminalAPI
          .createTerminal({
            id,
            cwd,
            shell,
            args,
            cols: terminal.cols || 80,
            rows: terminal.rows || 24,
          })
          .then(() => {
            if (!isMounted) {
              window.terminalAPI.kill(id);
              return;
            }

            cleanupData = window.terminalAPI.onData(id, (data: string) => {
              terminal.write(data);
              onActivity?.();
            });

            cleanupExit = window.terminalAPI.onExit(id, (_status) => {
              if (onExit) onExit();
            });

            terminal.onData((data) => {
              window.terminalAPI.write(id, data);
            });

            window.terminalAPI.resize(id, {
              cols: terminal.cols,
              rows: terminal.rows,
            });
            onSizeChange?.({ cols: terminal.cols, rows: terminal.rows });
          });
      });
    };

    initTerminal();

    const handleResize = () => {
      if (!isVisibleRef.current) return;
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        window.terminalAPI.resize(id, {
          cols: xtermRef.current.cols,
          rows: xtermRef.current.rows,
        });
        onSizeChange?.({ cols: xtermRef.current.cols, rows: xtermRef.current.rows });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (isMounted) handleResize();
    });

    resizeObserver.observe(terminalRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (cleanupData) cleanupData();
      if (cleanupExit) cleanupExit();
      window.terminalAPI.kill(id);
      terminal.dispose();
      onDispose?.(id);
    };
  }, [id]);

  useEffect(() => {
    if (!isActive) return;
    const handle = requestAnimationFrame(() => {
      xtermRef.current?.focus();
    });
    return () => cancelAnimationFrame(handle);
  }, [isActive]);

  return (
    <div
      ref={terminalRef}
      className="terminal-view w-full h-full p-2 overflow-hidden"
      style={{ backgroundColor: XTERM_THEMES[theme].background }}
    />
  );
};

export default TerminalView;

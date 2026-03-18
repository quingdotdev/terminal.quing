import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import { XTERM_THEMES, type ThemeFamily, type ThemeVariant } from '../state/themes';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A small, high-signal ligature set (similar to what many dev fonts provide).
// This is used with xterm's canvas renderer via `registerCharacterJoiner`.
const LIGATURE_SEQUENCES = [
  '<!---', '<!--', '--->', '<---', '<--', '-->',
  '<==>', '<===>', '<=>', '<==', '==>', '===>', '=>', '<=',
  '>=', '>>=', '<<=', '>>', '<<', '>>>', '<<<',
  '!==', '===', '!=', '==',
  '<->', '<-->', '<!-->', '->', '<-',
  ':::', '::', ':=', '=:',
  '&&', '||',
  '++', '+++', '--',
  '/*', '*/', '//', '///',
  '...', '..',
].sort((a, b) => b.length - a.length);

const LIGATURE_REGEX = new RegExp(LIGATURE_SEQUENCES.map(escapeRegExp).join('|'), 'g');

/**
 * Public API for interacting with a TerminalView instance.
 */
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
  theme: ThemeFamily;
  themeVariant: ThemeVariant;
  terminalFontFamily: string;
  terminalFontLigatures: boolean;
  isActive: boolean;
  isVisible: boolean;
  onExit?: () => void;
  onReady?: (id: string, api: TerminalApi) => void;
  onDispose?: (id: string) => void;
  onActivity?: () => void;
  onSizeChange?: (size: { cols: number; rows: number }) => void;
}

/**
 * this component wraps the xterm.js terminal. it handles the lifecycle of a single 
 * terminal pane. it communicates with the electron main process to run a real shell.
 */
const TerminalView: React.FC<TerminalViewProps> = ({
  id,
  cwd,
  shell,
  args,
  theme,
  themeVariant,
  terminalFontFamily,
  terminalFontLigatures,
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
  const joinerIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(isVisible);

  /**
   * this effect keeps the visibility ref in sync. it also triggers a resize 
   * calculation when a terminal becomes visible.
   */
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

  /**
   * this effect updates the xterm theme and font family when the app settings change.
   */
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = XTERM_THEMES[theme][themeVariant];
      xtermRef.current.options.fontFamily = terminalFontFamily;
    }
  }, [theme, themeVariant, terminalFontFamily]);

  /**
   * this is the main setup for the terminal. it runs once when the component mounts.
   */
  useEffect(() => {
    if (!terminalRef.current) return;

    let isMounted = true;
    let cleanupData: (() => void) | undefined;
    let cleanupExit: (() => void) | undefined;

    // first we create the xterm instance. we enable the cursor and set the font.
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: terminalFontFamily,
      theme: XTERM_THEMES[theme][themeVariant],
      allowProposedApi: true,
    });

    // then we add the fit and search plugins.
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.open(terminalRef.current);

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // we create a simple api so the parent component can control this terminal.
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

    // this function starts the actual shell process in the background.
    const initTerminal = async () => {
      requestAnimationFrame(() => {
        if (!isMounted) return;
        if (isVisibleRef.current) {
          fitAddon.fit();
        }
        
        // we ask the electron bridge to create a new pty process.
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

            // when the pty sends data, we write it to the screen.
            cleanupData = window.terminalAPI.onData(id, (data: string) => {
              terminal.write(data);
              onActivity?.();
            });

            // when the shell exits, we notify the parent.
            cleanupExit = window.terminalAPI.onExit(id, (_status) => {
              if (onExit) onExit();
            });

            // when the user types, we send the keys to the shell.
            terminal.onData((data) => {
              window.terminalAPI.write(id, data);
            });

            // we tell the shell the initial size of the window.
            window.terminalAPI.resize(id, {
              cols: terminal.cols,
              rows: terminal.rows,
            });
            onSizeChange?.({ cols: terminal.cols, rows: terminal.rows });
          });
      });
    };

    initTerminal();

    // this handler manages resizing when the container changes size.
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

    // finally we clean up everything when the terminal is closed.
    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (cleanupData) cleanupData();
      if (cleanupExit) cleanupExit();
      if (joinerIdRef.current !== null) {
        terminal.deregisterCharacterJoiner(joinerIdRef.current);
        joinerIdRef.current = null;
      }
      window.terminalAPI.kill(id);
      terminal.dispose();
      onDispose?.(id);
    };
  }, [id]);

  /**
   * this effect handles font ligatures. it tells xterm how to join characters 
   * together into single symbols.
   */
  useEffect(() => {
    const terminal = xtermRef.current;
    if (!terminal) return;

    if (terminalFontLigatures) {
      if (joinerIdRef.current === null) {
        joinerIdRef.current = terminal.registerCharacterJoiner((text) => {
          const ranges: [number, number][] = [];
          let match: RegExpExecArray | null;
          while ((match = LIGATURE_REGEX.exec(text)) !== null) {
            ranges.push([match.index, match.index + match[0].length]);
          }
          LIGATURE_REGEX.lastIndex = 0;
          return ranges;
        });
      }
      terminal.refresh(0, Math.max(0, terminal.rows - 1));
      return;
    }

    if (joinerIdRef.current !== null) {
      terminal.deregisterCharacterJoiner(joinerIdRef.current);
      joinerIdRef.current = null;
      terminal.refresh(0, Math.max(0, terminal.rows - 1));
    }
  }, [terminalFontLigatures]);

  /**
   * this effect focuses the terminal when the user switches to this tab.
   */
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
      style={{ 
        backgroundColor: XTERM_THEMES[theme][themeVariant].background,
        fontFamily: terminalFontFamily,
        fontVariantLigatures: terminalFontLigatures ? 'normal' : 'none',
        fontFeatureSettings: terminalFontLigatures ? '"liga" 1, "calt" 1' : '"liga" 0, "calt" 0'
      }}
    />
  );
};

export default TerminalView;

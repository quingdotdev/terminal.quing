import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  setSidebarCollapsed: (fn: (prev: boolean) => boolean) => void;
  setShowPalette: (fn: (prev: boolean) => boolean) => void;
  setPaletteSearch: (val: string) => void;
  setPaletteIndex: (val: number) => void;
  handleCopy: () => void;
  handlePaste: () => void;
  setShowFind: (val: boolean) => void;
  activeProject: any;
  activeTabId: string;
  setActiveTab: (id: string) => void;
  activeTab: any;
  activePaneId: string | undefined;
  activatePane: (projectId: string, tabId: string, paneId: string, focus: boolean) => void;
  activeProjectId: string;
  showPalette: boolean;
  setCurrentView: (view: 'terminal' | 'settings') => void;
  projects: any[];
  setActiveProjectId: (id: string) => void;
  quickProfiles: any[];
  addTab: (projectId: string, profileId: string) => void;
}

/**
 * Custom hook to register global keyboard shortcuts for the application.
 * Handles common operations like switching tabs, projects, opening the command palette, etc.
 * 
 * @param props - State setters and handlers needed for shortcut actions.
 */
export const useKeyboardShortcuts = ({
  setSidebarCollapsed,
  setShowPalette,
  setPaletteSearch,
  setPaletteIndex,
  handleCopy,
  handlePaste,
  setShowFind,
  activeProject,
  activeTabId,
  setActiveTab,
  activeTab,
  activePaneId,
  activatePane,
  activeProjectId,
  showPalette,
  setCurrentView,
  projects,
  setActiveProjectId,
  quickProfiles,
  addTab,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Alt+B: Toggle Sidebar
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      // Ctrl+Shift+P: Open Command Palette
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setShowPalette((prev) => !prev);
        setPaletteSearch('');
        setPaletteIndex(0);
        return;
      }

      // Stop processing global shortcuts if focus is in an input (unless palette is open)
      const target = event.target as HTMLElement | null;
      const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isEditable && !showPalette) {
        return;
      }

      // Ctrl+Shift+C / Ctrl+Shift+V: Terminal Copy/Paste
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        handleCopy();
        return;
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        handlePaste();
        return;
      }

      // Ctrl+F: Find
      if (event.ctrlKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setShowFind(true);
        return;
      }

      // Ctrl+(Shift)+Tab: Cycle Tabs
      if (event.ctrlKey && event.key === 'Tab') {
        event.preventDefault();
        if (!activeProject) return;
        const idx = activeProject.tabs.findIndex((t: any) => t.id === activeTabId);
        const next = event.shiftKey ? idx - 1 : idx + 1;
        const wrap = (next + activeProject.tabs.length) % activeProject.tabs.length;
        if (activeProject.tabs[wrap]) setActiveTab(activeProject.tabs[wrap].id);
        return;
      }

      // Ctrl+Alt+Arrows: Cycle Panes within split tab
      if (event.ctrlKey && event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        if (!activeTab) return;
        const panes = activeTab.panes;
        const idx = panes.findIndex((p: any) => p.id === activePaneId);
        if (idx === -1) return;
        const next = event.key === 'ArrowLeft' ? idx - 1 : idx + 1;
        const wrap = (next + panes.length) % panes.length;
        const pane = panes[wrap];
        if (pane) activatePane(activeProjectId, activeTab.id, pane.id, true);
        return;
      }

      // Palette Navigation
      if (showPalette) {
        if (event.key === 'Escape') setShowPalette(() => false);
        return;
      }

      // Ctrl+, : Settings
      if (event.ctrlKey && event.key === ',') {
        event.preventDefault();
        setCurrentView('settings');
      }

      // Alt+1-9: Switch Projects
      if (event.altKey && !event.ctrlKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const index = parseInt(event.key, 10) - 1;
        if (projects[index]) {
          setActiveProjectId(projects[index].id);
          if (projects[index].tabs.length > 0) setActiveTab(projects[index].tabs[0].id);
          setCurrentView('terminal');
        }
      }

      // Ctrl+1-9: Switch Tabs
      if (event.ctrlKey && !event.shiftKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const activeProj = projects.find((p) => p.id === activeProjectId);
        if (activeProj) {
          const index = parseInt(event.key, 10) - 1;
          if (activeProj.tabs[index]) {
            setActiveTab(activeProj.tabs[index].id);
            setCurrentView('terminal');
          }
        }
      }

      // Ctrl+Shift+1-3: New Terminal from quick profile
      if (event.ctrlKey && event.shiftKey && (event.code.startsWith('Digit') || /^[1-9]$/.test(event.key) || /^[!@#$%^&*()]$/.test(event.key))) {
        const digitMatch = event.code.match(/Digit(\d)/);
        const digit = digitMatch ? parseInt(digitMatch[1], 10) : null;
        if (digit && quickProfiles[digit - 1]) {
          event.preventDefault();
          addTab(activeProjectId, quickProfiles[digit - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setSidebarCollapsed,
    setShowPalette,
    setPaletteSearch,
    setPaletteIndex,
    handleCopy,
    handlePaste,
    setShowFind,
    activeProject,
    activeTabId,
    setActiveTab,
    activeTab,
    activePaneId,
    activatePane,
    activeProjectId,
    showPalette,
    setCurrentView,
    projects,
    setActiveProjectId,
    quickProfiles,
    addTab,
  ]);
};

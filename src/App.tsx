import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Settings,
  Moon,
  Sun,
  Search,
  Columns,
  Download,
  Import,
} from 'lucide-react';
import TerminalView from './components/TerminalView';
import StatusBar from './components/StatusBar';
import TerminalSearchBar from './components/TerminalSearchBar';
import Onboarding from './components/Onboarding';
import CommandPalette from './components/CommandPalette';
import ContextMenu from './components/ContextMenu';
import Sidebar from './components/Sidebar';
import TabStrip from './components/TabStrip';
import SettingsView from './components/SettingsView';
import { cn } from './utils/cn';
import { useWorkspace } from './hooks/useWorkspace';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { THEME_ORDER, THEME_LABELS } from './state/themes';
import type { TerminalTab } from './state/types';

const PRESET_COLORS = [
  { name: 'default', value: undefined },
  { name: 'red', value: '#EF4444' },
  { name: 'orange', value: '#F97316' },
  { name: 'yellow', value: '#EAB308' },
  { name: 'green', value: '#22C55E' },
  { name: 'blue', value: '#3B82F6' },
  { name: 'purple', value: '#A855F7' },
  { name: 'pink', value: '#EC4899' },
];

/**
 * Root Application Component.
 * Orchestrates the overall layout, workspace state, keyboard shortcuts, and view switching.
 */
const App: React.FC = () => {
  // Centralized workspace management logic
  const {
    projects,
    setProjects,
    profiles,
    activeProjectId,
    setActiveProjectId,
    activeTabId,
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    tabActivity,
    terminalApis,
    getProfileById,
    setActiveTab,
    activatePane,
    addTab,
    splitTab,
    unsplitTab,
    moveTab,
    reorderTabs,
    setTabColor,
    removeTab,
    removePane,
    removeProject,
    duplicateTab,
    addProject,
    handleRenameProject,
    handleRenameTab,
    resetWorkspace,
    updateProfile,
    importWorkspace,
    handleActivity,
  } = useWorkspace();

  // Local UI state
  const [currentView, setCurrentView] = useState<'terminal' | 'settings'>('terminal');
  const [showShellMenu, setShowShellMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'project' | 'tab' | 'terminal'; targetId: string } | null>(null);
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const [showSplitSubmenu, setShowSplitSubmenu] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('hasCompletedOnboarding') !== 'true');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [compactTabs, setCompactTabs] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [paneSizesMap, setPaneSizesMap] = useState<Record<string, { cols: number; rows: number }>>({});
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);

  // Refs for DOM manipulation and component communication
  const menuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const tabStripRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paneContainerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ tabId: string; index: number; startX: number; startSizes: number[]; containerWidth: number } | null>(null);

  const quickProfiles = profiles.slice(0, 3);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Derived active state
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeTab = activeProject?.tabs.find((t) => t.id === activeTabId) || activeProject?.tabs[0];
  const activePaneId = activeTab?.activePaneId || activeTab?.panes?.[0]?.id;
  const activePane = activeTab?.panes.find((p) => p.id === activePaneId) || activeTab?.panes?.[0];

  /**
   * Resolves final shell configuration for a pane based on its assigned profile.
   */
  const resolvePaneConfig = useCallback((pane?: any) => {
    const profile = getProfileById(pane?.profileId);
    return {
      profile,
      shell: pane?.shell || profile.shell,
      args: pane?.args ?? profile.args,
      cwd: pane?.cwd ?? profile.cwd,
    };
  }, [getProfileById]);

  /**
   * Handlers for terminal selection and clipboard operations.
   */
  const handleCopy = useCallback(() => {
    if (!activePaneId) return;
    const api = terminalApis.current.get(activePaneId);
    const selection = api?.copySelection();
    if (selection) (window as any).terminalAPI.writeClipboard(selection);
  }, [activePaneId, terminalApis]);

  const handlePaste = useCallback(() => {
    if (!activePaneId) return;
    const api = terminalApis.current.get(activePaneId);
    const text = (window as any).terminalAPI.readClipboard();
    if (text) api?.pasteText(text);
  }, [activePaneId, terminalApis]);

  const handleSelectAll = useCallback(() => {
    if (!activePaneId) return;
    terminalApis.current.get(activePaneId)?.selectAll();
  }, [activePaneId, terminalApis]);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
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
  });

  /**
   * List of actions available in the Command Palette.
   */
  const paletteActions = useMemo(() => {
    const actions: Array<{ label: string; icon: any; action: () => void; category: string }> = [];
    profiles.forEach((profile) => {
      actions.push({
        label: `new ${profile.name} terminal`,
        icon: <Plus size={14} />,
        action: () => addTab(activeProjectId, profile.id),
        category: 'profiles',
      });
    });
    actions.push({
      label: 'split active tab',
      icon: <Columns size={14} />,
      action: () => activeTab && splitTab(activeProjectId, activeTab.id),
      category: 'layout',
    });
    actions.push({
      label: 'unsplit active tab',
      icon: <Columns size={14} />,
      action: () => activeTab && unsplitTab(activeProjectId, activeTab.id),
      category: 'layout',
    });
    actions.push({
      label: 'find in terminal',
      icon: <Search size={14} />,
      action: () => setShowFind(true),
      category: 'terminal',
    });
    actions.push({
      label: `toggle theme (current: ${THEME_LABELS[theme]})`,
      icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
      action: () => setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]),
      category: 'app',
    });
    actions.push({
      label: 'open settings',
      icon: <Settings size={14} />,
      action: () => { setCurrentView('settings'); setShowPalette(false); },
      category: 'app',
    });
    actions.push({
      label: 'export workspace',
      icon: <Download size={14} />,
      action: () => {
        const state = { version: 2, projects, activeProjectId, activeTabId, theme, profiles, sidebarCollapsed };
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'terminal-workspace.json';
        a.click();
        URL.revokeObjectURL(url);
      },
      category: 'workspace',
    });
    actions.push({
      label: 'import workspace',
      icon: <Import size={14} />,
      action: () => fileInputRef.current?.click(),
      category: 'workspace',
    });
    return actions.filter((a) => a.label.toLowerCase().includes(paletteSearch.toLowerCase()));
  }, [profiles, activeProjectId, activeTab, theme, projects, activeTabId, sidebarCollapsed, paletteSearch, addTab, splitTab, unsplitTab, setTheme, setCurrentView]);

  /**
   * Pane Resizing Logic.
   * Uses a persistent resize observer and mouse event listeners.
   */
  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!resizeRef.current) return;
    const { tabId, index, startX, startSizes, containerWidth } = resizeRef.current;
    const delta = ((event.clientX - startX) / containerWidth) * 100;
    const min = 10;
    let left = startSizes[index] + delta;
    let right = startSizes[index + 1] - delta;
    if (left < min) { right -= min - left; left = min; }
    if (right < min) { left -= min - right; right = min; }
    if (left < min || right < min) return;
    const nextSizes = [...startSizes];
    nextSizes[index] = left;
    nextSizes[index + 1] = right;
    setProjects((prev: any) => prev.map((p: any) => p.id !== activeProjectId ? p : { ...p, tabs: p.tabs.map((t: any) => t.id === tabId ? { ...t, paneSizes: nextSizes } : t) }));
  }, [activeProjectId, setProjects]);

  const handleResizeEnd = useCallback(() => {
    resizeRef.current = null;
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => { window.removeEventListener('mousemove', handleResizeMove); window.removeEventListener('mouseup', handleResizeEnd); };
  }, [handleResizeMove, handleResizeEnd]);

  /**
   * Global click-outside listener for closing menus.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setShowShellMenu(false);
      if (contextMenuRef.current && !contextMenuRef.current.contains(target)) { setContextMenu(null); setShowColorSubmenu(false); setShowSplitSubmenu(false); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Evaluates if tabs should be rendered in "compact" mode based on count and width.
   */
  useLayoutEffect(() => {
    const element = tabStripRef.current;
    if (!element) return;
    const evaluate = () => {
      const tabCount = activeProject?.tabs?.length ?? 0;
      setCompactTabs(tabCount >= 7 || element.scrollWidth >= window.innerWidth * 0.75);
    };
    const raf = requestAnimationFrame(evaluate);
    const resizeObserver = new ResizeObserver(() => evaluate());
    resizeObserver.observe(element);
    window.addEventListener('resize', evaluate);
    return () => { cancelAnimationFrame(raf); resizeObserver.disconnect(); window.removeEventListener('resize', evaluate); };
  }, [projects, activeProjectId, sidebarCollapsed, sidebarHovered, activeProject]);

  /**
   * Helper to render the label for a tab, considering split panes and compact mode.
   */
  const renderTabLabel = (tab: TerminalTab) => {
    const parts = (tab.panes || []).map((p) => ({ title: p.title || tab.title || 'terminal', color: p.color }));
    if (tab.panes.length <= 1) return <span>{tab.title}</span>;
    const full = parts.map((p) => p.title).join(' | ');
    const displayParts = compactTabs ? parts.slice(0, 2) : parts;
    return (
      <span title={full}>
        {displayParts.map((p, i) => (
          <React.Fragment key={`${p.title}-${i}`}>
            {i > 0 && <span className="opacity-40"> | </span>}
            <span style={p.color ? { color: p.color } : undefined}>{p.title}</span>
          </React.Fragment>
        ))}
        {compactTabs && parts.length > 2 && <span className="opacity-40"> +{parts.length - 2}</span>}
      </span>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[var(--start)] text-[var(--charcoal)] transition-colors duration-200">
      {/* Overlay UI components */}
      {showOnboarding && <Onboarding step={onboardingStep} onStepChange={setOnboardingStep} onComplete={() => { localStorage.setItem('hasCompletedOnboarding', 'true'); setShowOnboarding(false); }} />}
      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          menuRef={contextMenuRef}
          showColorSubmenu={showColorSubmenu}
          setShowColorSubmenu={setShowColorSubmenu}
          showSplitSubmenu={showSplitSubmenu}
          setShowSplitSubmenu={setShowSplitSubmenu}
          onSetTabColor={(color) => setTabColor(activeProjectId, contextMenu.targetId, color)}
          onStartRenaming={(id, val) => { setEditingId(id); setEditValue(val); setContextMenu(null); }}
          onDuplicateTab={() => duplicateTab(activeProjectId, contextMenu.targetId)}
          onUnsplitTab={() => unsplitTab(activeProjectId, contextMenu.targetId)}
          onSplitTab={(sourceId) => splitTab(activeProjectId, contextMenu.targetId, sourceId)}
          onMoveTab={(dir) => moveTab(activeProjectId, contextMenu.targetId, dir)}
          onExportWorkspace={() => {
            const state = { version: 2, projects, activeProjectId, activeTabId, theme, profiles, sidebarCollapsed };
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'terminal-workspace.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          onShowFind={() => { setShowFind(true); setContextMenu(null); }}
          onRemoveTab={() => removeTab(activeProjectId, contextMenu.targetId)}
          onCopy={() => { handleCopy(); setContextMenu(null); }}
          onPaste={() => { handlePaste(); setContextMenu(null); }}
          onSelectAll={() => { handleSelectAll(); setContextMenu(null); }}
          onRemoveProject={() => removeProject(contextMenu.targetId)}
          tabs={activeProject?.tabs || []}
          projects={projects}
          presetColors={PRESET_COLORS}
        />
      )}
      {showPalette && <CommandPalette inputRef={paletteInputRef} search={paletteSearch} onSearchChange={setPaletteSearch} actions={paletteActions} activeIndex={paletteIndex} onActionIndexChange={setPaletteIndex} onRunAction={(idx) => paletteActions[idx]?.action()} onClose={() => setShowPalette(false)} />}

      {/* Main Layout */}
      <Sidebar collapsed={sidebarCollapsed} hovered={sidebarHovered} onHoverChange={setSidebarHovered} projects={projects} activeProjectId={activeProjectId} onProjectClick={(id) => { setActiveProjectId(id); const p = projects.find(proj => proj.id === id); if (p && p.tabs.length > 0) setActiveTab(p.tabs[0].id); setCurrentView('terminal'); }} onAddProject={addProject} onContextMenu={(e, id) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'project', targetId: id }); setShowColorSubmenu(false); setShowSplitSubmenu(false); }} onStartRenaming={(id, val) => { setEditingId(id); setEditValue(val); setContextMenu(null); }} editingId={editingId} editValue={editValue} onEditValueChange={setEditValue} onRenameProject={(id) => { handleRenameProject(id, editValue); setEditingId(null); }} />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <TabStrip tabs={activeProject?.tabs || []} activeTabId={activeTabId} currentView={currentView} compactTabs={compactTabs} onTabClick={setActiveTab} onRemoveTab={(id, e) => removeTab(activeProjectId, id, e)} onAddTab={(profileId) => addTab(activeProjectId, profileId)} onReorderTabs={(from, to) => reorderTabs(activeProjectId, from, to)} onStartRenaming={(id, val) => { setEditingId(id); setEditValue(val); setContextMenu(null); }} onContextMenu={(e, type, id) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type, targetId: id }); setShowColorSubmenu(false); setShowSplitSubmenu(false); }} draggingTabId={draggingTabId} setDraggingTabId={setDraggingTabId} editingId={editingId} editValue={editValue} onEditValueChange={setEditValue} onRenameTab={(id) => { handleRenameTab(activeProjectId, id, editValue); setEditingId(null); }} tabActivity={tabActivity} showShellMenu={showShellMenu} setShowShellMenu={setShowShellMenu} profiles={profiles} theme={theme} onToggleTheme={() => setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length])} onSetCurrentView={setCurrentView} onShowPalette={setShowPalette} tabStripRef={tabStripRef} menuRef={menuRef} renderTabLabel={renderTabLabel} getSplitTitleParts={(tab) => (tab.panes || []).map((p: any) => ({ title: p.title || tab.title || 'terminal', color: p.color }))} />
        
        <div className="flex-1 relative bg-[var(--start)] overflow-hidden">
          {/* Hidden input for workspace import */}
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (typeof result !== 'string') return;
                try {
                  importWorkspace(JSON.parse(result || '{}'));
                  setCurrentView('terminal');
                } catch {
                  alert('invalid workspace file');
                }
              };
              reader.readAsText(file);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
          }} />

          {/* Terminal View Container */}
          <div className="absolute inset-0">
            {showFind && currentView === 'terminal' && <TerminalSearchBar value={findQuery} onChange={setFindQuery} onNext={() => terminalApis.current.get(activePaneId!)?.findNext(findQuery)} onPrev={() => terminalApis.current.get(activePaneId!)?.findPrevious(findQuery)} onClose={() => { terminalApis.current.get(activePaneId!)?.clearSearch(); setShowFind(false); }} />}
            
            {projects.map((project) => project.tabs.map((tab) => {
              const isVisible = project.id === activeProjectId && tab.id === activeTabId && currentView === 'terminal';
              const sizes = tab.paneSizes && tab.paneSizes.length === tab.panes.length ? tab.paneSizes : tab.panes.map(() => 100 / Math.max(1, tab.panes.length));
              return (
                <div key={`${project.id}-${tab.id}`} style={{ display: isVisible ? 'flex' : 'none' }} className="absolute inset-0 flex flex-row w-full h-full overflow-hidden" ref={isVisible ? paneContainerRef : undefined}>
                  {tab.panes.map((pane, idx) => {
                    const { shell, args, cwd } = resolvePaneConfig(pane);
                    const isActivePane = tab.activePaneId ? tab.activePaneId === pane.id : idx === 0;
                    return (
                      <React.Fragment key={pane.id}>
                        <div
                          role="button"
                          tabIndex={isActivePane ? -1 : 0}
                          className={cn('h-full relative overflow-hidden outline-none', isActivePane && 'pane-active')}
                          style={{ flex: `0 0 ${sizes[idx]}%` }}
                          onClick={() => activatePane(project.id, tab.id, pane.id, true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              activatePane(project.id, tab.id, pane.id, true);
                            }
                          }}
                          onContextMenu={(e) => {
                            activatePane(project.id, tab.id, pane.id, false);
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, type: 'terminal', targetId: pane.id });
                            setShowColorSubmenu(false);
                            setShowSplitSubmenu(false);
                          }}
                        >
                          <TerminalView id={pane.id} shell={shell} args={args} cwd={cwd} theme={theme} isActive={isActivePane && isVisible} isVisible={isVisible} onExit={() => removePane(project.id, tab.id, pane.id)} onActivity={() => handleActivity(pane.id, projects, activeTab, activePaneId, currentView)} onSizeChange={(size) => setPaneSizesMap((prev) => ({ ...prev, [pane.id]: size }))} onReady={(id, api) => terminalApis.current.set(id, api)} onDispose={(id) => terminalApis.current.delete(id)} />
                        </div>
                        {/* Vertical resize handle */}
                        {idx < tab.panes.length - 1 && <div className="pane-resizer" onMouseDown={(e) => { e.preventDefault(); const container = paneContainerRef.current; if (!container) return; const width = container.getBoundingClientRect().width || 1; const sizes = tab.paneSizes || tab.panes.map(() => 100 / Math.max(1, tab.panes.length)); resizeRef.current = { tabId: tab.id, index: idx, startX: e.clientX, startSizes: sizes, containerWidth: width }; document.body.style.cursor = 'col-resize'; }} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }))}
            
            {(!activeTab || activeTab.panes.length === 0) && currentView === 'terminal' && <div className="absolute inset-0 flex items-center justify-center text-[var(--charcoal)] opacity-30 lowercase italic">no active terminals. press Ctrl+Shift+1 to open one.</div>}
          </div>

          {/* Settings View Container */}
          {currentView === 'settings' && <SettingsView profiles={profiles} updateProfile={updateProfile} theme={theme} setTheme={setTheme} exportWorkspace={() => { const state = { version: 2, projects, activeProjectId, activeTabId, theme, profiles, sidebarCollapsed }; const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'terminal-workspace.json'; a.click(); URL.revokeObjectURL(url); }} importWorkspace={() => fileInputRef.current?.click()} showOnboarding={() => { setShowOnboarding(true); setOnboardingStep(0); setCurrentView('terminal'); }} resetState={resetWorkspace} />}
        </div>

        <StatusBar projectName={activeProject?.name} tabTitle={activeTab?.title} profileName={resolvePaneConfig(activePane).profile.name} cwd={resolvePaneConfig(activePane).cwd || '~'} cols={activePaneId ? paneSizesMap[activePaneId]?.cols : undefined} rows={activePaneId ? paneSizesMap[activePaneId]?.rows : undefined} isConnected={Boolean(activePaneId)} />
      </main>
    </div>
  );
};

export default App;

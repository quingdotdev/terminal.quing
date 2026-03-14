import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Folder,
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  Command,
  Sun,
  Moon,
  Search,
  Palette,
  Type,
  Copy,
  Columns,
  Download,
  Trash2,
  Edit3,
  ArrowLeft,
  ArrowRight,
  Clipboard,
  ClipboardPaste,
  List,
  Import,
  GripVertical,
} from 'lucide-react';
import TerminalView, { type TerminalApi } from './components/TerminalView';
import StatusBar from './components/StatusBar';
import TerminalSearchBar from './components/TerminalSearchBar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { loadWorkspace, saveWorkspace, normalizeWorkspace, DEFAULT_PROFILES } from './state/workspace';
import { THEME_ORDER, THEME_LABELS, type ThemeName } from './state/themes';
import type { Project, TerminalTab, Pane, Profile } from './state/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const randomId = () => Math.random().toString(36).slice(2, 9);

const App: React.FC = () => {
  const initialWorkspace = loadWorkspace();

  const [projects, setProjects] = useState<Project[]>(initialWorkspace.projects);
  const [profiles, setProfiles] = useState<Profile[]>(initialWorkspace.profiles);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialWorkspace.activeProjectId);
  const [activeTabId, setActiveTabId] = useState<string>(initialWorkspace.activeTabId);
  const [currentView, setCurrentView] = useState<'terminal' | 'settings'>('terminal');
  const [theme, setTheme] = useState<ThemeName>(initialWorkspace.theme);

  const [showShellMenu, setShowShellMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'project' | 'tab' | 'terminal'; targetId: string } | null>(null);
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const [showSplitSubmenu, setShowSplitSubmenu] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialWorkspace.sidebarCollapsed);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('hasCompletedOnboarding') !== 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState(0);

  const [compactTabs, setCompactTabs] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [tabActivity, setTabActivity] = useState<Record<string, boolean>>({});
  const [paneSizesMap, setPaneSizesMap] = useState<Record<string, { cols: number; rows: number }>>({});
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);

  const terminalApis = useRef<Map<string, TerminalApi>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const tabStripRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paneContainerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{
    tabId: string;
    index: number;
    startX: number;
    startSizes: number[];
    containerWidth: number;
  } | null>(null);

  const quickProfiles = profiles.slice(0, 3);

  useEffect(() => {
    saveWorkspace({
      version: 2,
      projects,
      activeProjectId,
      activeTabId,
      theme,
      profiles,
      sidebarCollapsed,
    });
  }, [projects, activeProjectId, activeTabId, theme, profiles, sidebarCollapsed]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeTab = activeProject?.tabs.find((t) => t.id === activeTabId) || activeProject?.tabs[0];
  const activePaneId = activeTab?.activePaneId || activeTab?.panes?.[0]?.id;
  const activePane = activeTab?.panes.find((p) => p.id === activePaneId) || activeTab?.panes?.[0];

  const getProfileById = useCallback((profileId?: string) => {
    return profiles.find((p) => p.id === profileId) || profiles[0] || DEFAULT_PROFILES[0];
  }, [profiles]);

  const resolvePaneConfig = useCallback((pane?: Pane) => {
    const profile = getProfileById(pane?.profileId);
    return {
      profile,
      shell: pane?.shell || profile.shell,
      args: pane?.args ?? profile.args,
      cwd: pane?.cwd ?? profile.cwd,
    };
  }, [getProfileById]);

  const setActiveTab = (tabId: string) => {
    setActiveTabId(tabId);
    setCurrentView('terminal');
    setTabActivity((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
  };

  const activatePane = (projectId: string, tabId: string, paneId: string, focus = true) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tabs: p.tabs.map((t) => (t.id === tabId ? { ...t, activePaneId: paneId } : t)),
        };
      })
    );
    setTabActivity((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
    if (focus) {
      terminalApis.current.get(paneId)?.focus();
    }
  };

  const addTab = (projectId: string, profileId?: string) => {
    const profile = getProfileById(profileId);
    const tabId = randomId();
    const paneId = randomId();
    const pane: Pane = {
      id: paneId,
      title: profile.name,
      profileId: profile.id,
      shell: profile.shell,
      args: profile.args,
      cwd: profile.cwd,
    };
    const newTab: TerminalTab = {
      id: tabId,
      title: profile.name,
      panes: [pane],
      paneSizes: [100],
      activePaneId: paneId,
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tabs: [...p.tabs, newTab] } : p))
    );
    setActiveTab(tabId);
    setShowShellMenu(false);
    setShowPalette(false);
  };

  const splitTab = (projectId: string, targetTabId: string, sourceTabId?: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const targetTab = p.tabs.find((t) => t.id === targetTabId);
        if (!targetTab) return p;

        let newPanes = [...targetTab.panes].map((pane) => ({
          ...pane,
          title: pane.title || targetTab.title || 'terminal',
          color: pane.color ?? targetTab.color,
        }));
        let newTabs = [...p.tabs];

        if (sourceTabId) {
          const sourceTab = p.tabs.find((t) => t.id === sourceTabId);
          if (sourceTab) {
            const sourcePanes = sourceTab.panes.map((pane) => ({
              ...pane,
              title: pane.title || sourceTab.title || 'terminal',
              color: pane.color ?? sourceTab.color,
            }));
            newPanes = [...newPanes, ...sourcePanes];
            newTabs = newTabs.filter((t) => t.id !== sourceTabId);
          }
        } else {
          const sourcePane = targetTab.panes.find((pane) => pane.id === targetTab.activePaneId) || targetTab.panes[targetTab.panes.length - 1];
          const profile = getProfileById(sourcePane?.profileId);
          const newPane: Pane = {
            id: randomId(),
            title: sourcePane?.title || targetTab.title || profile.name,
            color: sourcePane?.color ?? targetTab.color,
            profileId: profile.id,
            shell: sourcePane?.shell || profile.shell,
            args: sourcePane?.args ?? profile.args,
            cwd: sourcePane?.cwd ?? profile.cwd,
          };
          newPanes = [...newPanes, newPane];
        }

        const sizes = newPanes.map(() => 100 / Math.max(1, newPanes.length));
        const activePaneIdNext = targetTab.activePaneId && newPanes.some((pane) => pane.id === targetTab.activePaneId)
          ? targetTab.activePaneId
          : newPanes[0]?.id;

        return {
          ...p,
          tabs: newTabs.map((t) => (t.id === targetTabId ? { ...t, panes: newPanes, paneSizes: sizes, activePaneId: activePaneIdNext } : t)),
        };
      })
    );
    setContextMenu(null);
    setShowSplitSubmenu(false);
    setActiveTab(targetTabId);
  };

  const unsplitTab = (projectId: string, tabId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tabIndex = p.tabs.findIndex((t) => t.id === tabId);
        if (tabIndex === -1) return p;

        const tab = p.tabs[tabIndex];
        if (!tab || tab.panes.length <= 1) return p;

        const normalizedPanes = tab.panes.map((pane) => ({
          ...pane,
          title: pane.title || tab.title || 'terminal',
          color: pane.color ?? tab.color,
        }));

        const [firstPane, ...restPanes] = normalizedPanes;
        const updatedTabs = [...p.tabs];

        const firstPaneId = randomId();
        updatedTabs[tabIndex] = {
          ...tab,
          title: firstPane.title || tab.title,
          color: firstPane.color ?? tab.color,
          panes: [{ ...firstPane, id: firstPaneId }],
          paneSizes: [100],
          activePaneId: firstPaneId,
        };

        const newTabs: TerminalTab[] = restPanes.map((pane) => {
          const newTabId = randomId();
          const newPaneId = randomId();
          return {
            id: newTabId,
            title: pane.title || 'terminal',
            color: pane.color,
            panes: [{ ...pane, id: newPaneId }],
            paneSizes: [100],
            activePaneId: newPaneId,
          };
        });

        updatedTabs.splice(tabIndex + 1, 0, ...newTabs);
        return { ...p, tabs: updatedTabs };
      })
    );
    setContextMenu(null);
    setShowSplitSubmenu(false);
  };

  const moveTab = (projectId: string, tabId: string, direction: 'left' | 'right') => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const index = p.tabs.findIndex((t) => t.id === tabId);
        if (index === -1) return p;
        const newTabs = [...p.tabs];
        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newTabs.length) {
          [newTabs[index], newTabs[newIndex]] = [newTabs[newIndex], newTabs[index]];
        }
        return { ...p, tabs: newTabs };
      })
    );
    setContextMenu(null);
  };

  const reorderTabs = (projectId: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tabs = [...p.tabs];
        const fromIndex = tabs.findIndex((t) => t.id === fromId);
        const toIndex = tabs.findIndex((t) => t.id === toId);
        if (fromIndex === -1 || toIndex === -1) return p;
        const [moved] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, moved);
        return { ...p, tabs };
      })
    );
  };

  const setTabColor = (projectId: string, tabId: string, color?: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tabs: p.tabs.map((t) => {
            if (t.id !== tabId) return t;
            const next = { ...t, color };
            if (t.panes.length === 1) {
              next.panes = t.panes.map((pane) => ({ ...pane, color }));
            }
            return next;
          }),
        };
      })
    );
    setContextMenu(null);
    setShowColorSubmenu(false);
  };

  const removeTab = (projectId: string, tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const remainingTabs = p.tabs.filter((t) => t.id !== tabId);
        if (tabId === activeTabId && remainingTabs.length > 0) {
          setActiveTab(remainingTabs[0].id);
        }
        return { ...p, tabs: remainingTabs };
      })
    );
    setContextMenu(null);
  };

  const removePane = (projectId: string, tabId: string, paneId: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tabs: p.tabs.map((t) => {
            if (t.id !== tabId) return t;
            const remainingPanes = t.panes.filter((pane) => pane.id !== paneId);
            const nextActivePaneId = t.activePaneId === paneId ? remainingPanes[0]?.id : t.activePaneId;
            const paneSizes = remainingPanes.length > 0 ? remainingPanes.map(() => 100 / remainingPanes.length) : [];
            return { ...t, panes: remainingPanes, paneSizes, activePaneId: nextActivePaneId };
          }),
        };
      });

      const project = updated.find((p) => p.id === projectId);
      const tab = project?.tabs.find((t) => t.id === tabId);
      if (tab && tab.panes.length === 0) {
        return updated.map((p) => (p.id === projectId ? { ...p, tabs: p.tabs.filter((t) => t.id !== tabId) } : p));
      }
      return updated;
    });
  };

  const removeProject = (projectId: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      if (projectId === activeProjectId && remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
        if (remaining[0].tabs.length > 0) setActiveTab(remaining[0].tabs[0].id);
      }
      return remaining;
    });
    setContextMenu(null);
  };

  const duplicateTab = (projectId: string, tabId: string) => {
    const newTabId = randomId();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const tab = p.tabs.find((t) => t.id === tabId);
        if (!tab) return p;
        let newActivePaneId = tab.activePaneId;
        const newPanes = tab.panes.map((pane) => {
          const newPaneId = randomId();
          if (pane.id === tab.activePaneId) newActivePaneId = newPaneId;
          return { ...pane, id: newPaneId };
        });
        const newTab: TerminalTab = {
          ...tab,
          id: newTabId,
          panes: newPanes,
          paneSizes: tab.panes.map(() => 100 / Math.max(1, tab.panes.length)),
          activePaneId: newActivePaneId,
        };
        return { ...p, tabs: [...p.tabs, newTab] };
      })
    );
    setActiveTab(newTabId);
    setContextMenu(null);
  };

  const addProject = () => {
    const id = randomId();
    const tabId = `t-${id}-1`;
    const profile = getProfileById();
    const paneId = randomId();
    const newProject: Project = {
      id,
      name: `project-${projects.length + 1}`,
      tabs: [
        {
          id: tabId,
          title: profile.name,
          panes: [
            {
              id: paneId,
              shell: profile.shell,
              args: profile.args,
              cwd: profile.cwd,
              title: profile.name,
              profileId: profile.id,
            },
          ],
          paneSizes: [100],
          activePaneId: paneId,
        },
      ],
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(id);
    setActiveTab(tabId);
  };

  const startRenaming = (id: string, initialValue: string) => {
    setEditingId(id);
    setEditValue(initialValue);
    setContextMenu(null);
  };

  const handleRenameProject = (id: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, name: editValue || p.name } : p)));
    setEditingId(null);
  };

  const handleRenameTab = (projectId: string, tabId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tabs: p.tabs.map((t) => {
            if (t.id !== tabId) return t;
            const nextTitle = editValue || t.title;
            return {
              ...t,
              title: nextTitle,
              panes: t.panes.length === 1 ? t.panes.map((pane) => ({ ...pane, title: nextTitle })) : t.panes,
            };
          }),
        };
      })
    );
    setEditingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'project' | 'tab' | 'terminal', id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, targetId: id });
    setShowColorSubmenu(false);
    setShowSplitSubmenu(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const resetState = () => {
    if (confirm('this will clear all projects and tabs. are you sure?')) {
      localStorage.clear();
      const fresh = normalizeWorkspace({});
      setProjects(fresh.projects);
      setProfiles(fresh.profiles);
      setActiveProjectId(fresh.activeProjectId);
      setActiveTabId(fresh.activeTabId);
      setTheme(fresh.theme);
      setSidebarCollapsed(fresh.sidebarCollapsed);
      setCurrentView('terminal');
      setShowPalette(false);
    }
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const exportWorkspace = () => {
    const state = {
      version: 2,
      projects,
      activeProjectId,
      activeTabId,
      theme,
      profiles,
      sidebarCollapsed,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminal-workspace.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const normalized = normalizeWorkspace(parsed);
        setProjects(normalized.projects);
        setProfiles(normalized.profiles);
        setActiveProjectId(normalized.activeProjectId);
        setActiveTabId(normalized.activeTabId);
        setTheme(normalized.theme);
        setSidebarCollapsed(normalized.sidebarCollapsed);
        setCurrentView('terminal');
      } catch (_e) {
        alert('invalid workspace file');
      }
    };
    reader.readAsText(file);
  };

  const handleActivity = (paneId: string) => {
    const active = activeTab?.panes.some((p) => p.id === paneId);
    if (active && activePaneId === paneId && currentView === 'terminal') return;
    let tabForPane: TerminalTab | undefined;
    for (const project of projects) {
      const tab = project.tabs.find((t) => t.panes.some((p) => p.id === paneId));
      if (tab) {
        tabForPane = tab;
        break;
      }
    }
    if (!tabForPane) return;
    setTabActivity((prev) => ({ ...prev, [tabForPane!.id]: true }));
  };

  const handleCopy = () => {
    if (!activePaneId) return;
    const api = terminalApis.current.get(activePaneId);
    if (!api) return;
    const selection = api.copySelection();
    if (selection) window.terminalAPI.writeClipboard(selection);
  };

  const handlePaste = () => {
    if (!activePaneId) return;
    const api = terminalApis.current.get(activePaneId);
    if (!api) return;
    const text = window.terminalAPI.readClipboard();
    if (text) api.pasteText(text);
  };

  const handleSelectAll = () => {
    if (!activePaneId) return;
    const api = terminalApis.current.get(activePaneId);
    api?.selectAll();
  };

  const toggleTheme = () => {
    const index = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
    setTheme(next);
    setShowPalette(false);
  };

  const openFind = () => {
    setShowFind(true);
    setFindQuery('');
  };

  const focusNextPane = () => {
    if (!activeTab) return;
    const panes = activeTab.panes;
    if (panes.length === 0) return;
    const idx = panes.findIndex((p) => p.id === activePaneId);
    const next = (idx + 1) % panes.length;
    activatePane(activeProjectId, activeTab.id, panes[next].id, true);
  };

  const focusPrevPane = () => {
    if (!activeTab) return;
    const panes = activeTab.panes;
    if (panes.length === 0) return;
    const idx = panes.findIndex((p) => p.id === activePaneId);
    const prev = (idx - 1 + panes.length) % panes.length;
    activatePane(activeProjectId, activeTab.id, panes[prev].id, true);
  };

  const runFindNext = () => {
    if (!activePaneId) return;
    terminalApis.current.get(activePaneId)?.findNext(findQuery);
  };

  const runFindPrev = () => {
    if (!activePaneId) return;
    terminalApis.current.get(activePaneId)?.findPrevious(findQuery);
  };

  const closeFind = () => {
    if (!activePaneId) {
      setShowFind(false);
      return;
    }
    terminalApis.current.get(activePaneId)?.clearSearch();
    setShowFind(false);
  };

  const startResize = (event: React.MouseEvent, tabId: string, index: number) => {
    event.preventDefault();
    const container = paneContainerRef.current;
    if (!container) return;
    const width = container.getBoundingClientRect().width || 1;
    const tab = activeProject?.tabs.find((t) => t.id === tabId);
    const sizes = tab?.paneSizes || tab?.panes.map(() => 100 / Math.max(1, tab.panes.length)) || [];
    resizeRef.current = {
      tabId,
      index,
      startX: event.clientX,
      startSizes: sizes,
      containerWidth: width,
    };
    document.body.style.cursor = 'col-resize';
  };

  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!resizeRef.current) return;
    const { tabId, index, startX, startSizes, containerWidth } = resizeRef.current;
    const delta = ((event.clientX - startX) / containerWidth) * 100;
    const min = 10;
    let left = startSizes[index] + delta;
    let right = startSizes[index + 1] - delta;

    if (left < min) {
      right -= min - left;
      left = min;
    }
    if (right < min) {
      left -= min - right;
      right = min;
    }
    if (left < min || right < min) return;

    const nextSizes = [...startSizes];
    nextSizes[index] = left;
    nextSizes[index + 1] = right;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          tabs: p.tabs.map((t) => (t.id === tabId ? { ...t, paneSizes: nextSizes } : t)),
        };
      })
    );
  }, [activeProjectId]);

  const handleResizeEnd = useCallback(() => {
    resizeRef.current = null;
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    if (showPalette && paletteInputRef.current) paletteInputRef.current.focus();
  }, [showPalette]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setShowShellMenu(false);
      if (contextMenuRef.current && !contextMenuRef.current.contains(target)) {
        setContextMenu(null);
        setShowColorSubmenu(false);
        setShowSplitSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    const element = tabStripRef.current;
    if (!element) return;

    const EXPAND_THRESHOLD = 0.75;

    const evaluate = () => {
      const tabCount = activeProject?.tabs?.length ?? 0;
      const widthThresholdReached = element.scrollWidth >= window.innerWidth * EXPAND_THRESHOLD;
      setCompactTabs(tabCount >= 7 || widthThresholdReached);
    };

    const raf = requestAnimationFrame(evaluate);

    const resizeObserver = new ResizeObserver(() => evaluate());
    resizeObserver.observe(element);
    window.addEventListener('resize', evaluate);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('resize', evaluate);
    };
  }, [projects, activeProjectId, sidebarCollapsed, sidebarHovered]);

  useEffect(() => {
    if (projects.length === 0) return;
    const nextProject = projects.find((p) => p.id === activeProjectId) || projects[0];
    if (nextProject && nextProject.id !== activeProjectId) {
      setActiveProjectId(nextProject.id);
    }
    const nextTab = nextProject?.tabs.find((t) => t.id === activeTabId) || nextProject?.tabs[0];
    if (nextTab && nextTab.id !== activeTabId) {
      setActiveTabId(nextTab.id);
    }
  }, [projects, activeProjectId, activeTabId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setShowPalette((prev) => !prev);
        setPaletteSearch('');
        setPaletteIndex(0);
        return;
      }
      const target = event.target as HTMLElement | null;
      const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isEditable && !showPalette) {
        return;
      }
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
      if (event.ctrlKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setShowFind(true);
        return;
      }
      if (event.ctrlKey && event.key === 'Tab') {
        event.preventDefault();
        if (!activeProject) return;
        const idx = activeProject.tabs.findIndex((t) => t.id === activeTabId);
        const next = event.shiftKey ? idx - 1 : idx + 1;
        const wrap = (next + activeProject.tabs.length) % activeProject.tabs.length;
        if (activeProject.tabs[wrap]) setActiveTab(activeProject.tabs[wrap].id);
        return;
      }
      if (event.ctrlKey && event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        if (!activeTab) return;
        const panes = activeTab.panes;
        const idx = panes.findIndex((p) => p.id === activePaneId);
        if (idx === -1) return;
        const next = event.key === 'ArrowLeft' ? idx - 1 : idx + 1;
        const wrap = (next + panes.length) % panes.length;
        const pane = panes[wrap];
        if (pane) activatePane(activeProjectId, activeTab.id, pane.id, true);
        return;
      }
      if (showPalette) {
        if (event.key === 'Escape') setShowPalette(false);
        return;
      }
      if (event.ctrlKey && event.key === ',') {
        event.preventDefault();
        setCurrentView('settings');
      }
      if (event.altKey && !event.ctrlKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const index = parseInt(event.key, 10) - 1;
        if (projects[index]) {
          setActiveProjectId(projects[index].id);
          if (projects[index].tabs.length > 0) setActiveTab(projects[index].tabs[0].id);
          setCurrentView('terminal');
        }
      }
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
      if (event.ctrlKey && event.shiftKey && (event.code.startsWith('Digit') || /^[1-9]$/.test(event.key) || /^[!@#$%^&*()]$/.test(event.key))) {
        const digitMatch = event.code.match(/Digit(\\d)/);
        const digit = digitMatch ? parseInt(digitMatch[1], 10) : null;
        if (digit && quickProfiles[digit - 1]) {
          event.preventDefault();
          addTab(activeProjectId, quickProfiles[digit - 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects, activeProjectId, activeTabId, showPalette, activeProject, activeTab, activePaneId, quickProfiles]);

  const onboardingSteps = [
    {
      title: 'welcome to terminal by Quing',
      content: "a high-performance, customizable terminal emulator for modern workflows. let's take a quick tour of the features.",
      icon: <TerminalIcon size={48} />,
    },
    {
      title: 'command palette',
      content: 'press Ctrl + Shift + P to open the command palette. search and execute any action instantly without leaving your keyboard.',
      icon: <Search size={48} />,
    },
    {
      title: 'split tabs & panes',
      content: 'right-click any tab to split it into multiple panes. organize your workspace by seeing multiple shells side-by-side.',
      icon: <Columns size={48} />,
    },
    {
      title: 'keyboard shortcuts',
      content: (
        <ul className="text-left space-y-2 text-sm mt-4">
          <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Alt + 1-9</kbd> Switch Projects</li>
          <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Ctrl + 1-9</kbd> Switch Tabs</li>
          <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Ctrl + Shift + 1-3</kbd> New Terminal</li>
          <li><kbd className="px-2 py-1 bg-[var(--cornflower)] rounded">Ctrl + ,</kbd> Settings</li>
        </ul>
      ),
      icon: <Command size={48} />,
    },
    {
      title: 'ready to go',
      content: 'your workspace is automatically saved. double-click any tab or project name to rename it. enjoy your new terminal!',
      icon: <Sun size={48} />,
    },
  ];

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
      label: 'focus next pane',
      icon: <ArrowRight size={14} />,
      action: () => focusNextPane(),
      category: 'layout',
    });
    actions.push({
      label: 'focus previous pane',
      icon: <ArrowLeft size={14} />,
      action: () => focusPrevPane(),
      category: 'layout',
    });
    actions.push({
      label: 'find in terminal',
      icon: <Search size={14} />,
      action: () => openFind(),
      category: 'terminal',
    });
    actions.push({
      label: 'copy selection',
      icon: <Clipboard size={14} />,
      action: () => handleCopy(),
      category: 'terminal',
    });
    actions.push({
      label: 'paste',
      icon: <ClipboardPaste size={14} />,
      action: () => handlePaste(),
      category: 'terminal',
    });
    actions.push({
      label: `toggle theme (current: ${THEME_LABELS[theme]})`,
      icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
      action: toggleTheme,
      category: 'app',
    });
    actions.push({
      label: 'open settings',
      icon: <Maximize2 size={14} className="rotate-45" />,
      action: () => {
        setCurrentView('settings');
        setShowPalette(false);
      },
      category: 'app',
    });
    actions.push({
      label: `${sidebarCollapsed ? 'expand' : 'collapse'} sidebar`,
      icon: <Folder size={14} />,
      action: () => setSidebarCollapsed(!sidebarCollapsed),
      category: 'app',
    });
    actions.push({
      label: 'export workspace',
      icon: <Download size={14} />,
      action: exportWorkspace,
      category: 'workspace',
    });
    actions.push({
      label: 'import workspace',
      icon: <Import size={14} />,
      action: () => fileInputRef.current?.click(),
      category: 'workspace',
    });
    return actions.filter((a) => a.label.toLowerCase().includes(paletteSearch.toLowerCase()));
  }, [paletteSearch, theme, activeProjectId, sidebarCollapsed, profiles, activeTab]);

  const runPaletteAction = (index: number) => {
    const action = paletteActions[index];
    if (action) action.action();
  };

  const getSplitTitleParts = (tab: TerminalTab) => {
    return (tab.panes || []).map((p) => ({
      title: p.title || tab.title || 'terminal',
      color: p.color,
    }));
  };

  const renderTabLabel = (tab: TerminalTab) => {
    if (tab.panes.length <= 1) return <span>{tab.title}</span>;

    const parts = getSplitTitleParts(tab);
    const full = parts.map((p) => p.title).join(' | ');

    if (!compactTabs) {
      return (
        <span title={full}>
          {parts.map((p, i) => (
            <React.Fragment key={`${p.title}-${i}`}>
              {i > 0 && <span className="opacity-40"> | </span>}
              <span style={p.color ? { color: p.color } : undefined}>{p.title}</span>
            </React.Fragment>
          ))}
        </span>
      );
    }

    return (
      <span title={full}>
        {parts.slice(0, 2).map((p, i) => (
          <React.Fragment key={`${p.title}-${i}`}>
            {i > 0 && <span className="opacity-40"> | </span>}
            <span style={p.color ? { color: p.color } : undefined}>{p.title}</span>
          </React.Fragment>
        ))}
        {parts.length > 2 && <span className="opacity-40"> +{parts.length - 2}</span>}
      </span>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[var(--start)] text-[var(--charcoal)] transition-colors duration-200">
      {showOnboarding && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl rounded-lg overflow-hidden p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="mb-6 p-4 bg-[var(--cornflower)]/20 rounded-full">
              {onboardingSteps[onboardingStep].icon}
            </div>
            <h2 className="text-2xl font-bold mb-4 lowercase tracking-tight">
              {onboardingSteps[onboardingStep].title}
            </h2>
            <div className="text-[var(--charcoal)] opacity-80 mb-8 min-h-[100px] flex flex-col justify-center">
              {typeof onboardingSteps[onboardingStep].content === 'string' ? (
                <p className="lowercase leading-relaxed">{onboardingSteps[onboardingStep].content}</p>
              ) : (
                onboardingSteps[onboardingStep].content
              )}
            </div>

            <div className="flex items-center justify-between w-full mt-auto">
              <div className="flex gap-1">
                {onboardingSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      idx === onboardingStep ? 'w-6 bg-[var(--charcoal)]' : 'bg-[var(--cornflower)]'
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={completeOnboarding}
                  className="px-4 py-2 text-sm lowercase opacity-50 hover:opacity-100 transition-opacity"
                >
                  skip
                </button>
                <button
                  onClick={() => {
                    if (onboardingStep < onboardingSteps.length - 1) {
                      setOnboardingStep((prev) => prev + 1);
                    } else {
                      completeOnboarding();
                    }
                  }}
                  className="px-6 py-2 bg-[var(--charcoal)] text-[var(--start)] rounded-md text-sm font-semibold lowercase hover:opacity-90 transition-opacity shadow-lg"
                >
                  {onboardingStep === onboardingSteps.length - 1 ? 'get started' : 'next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-[2000] w-64 bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl rounded-sm py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 350),
            left: Math.min(contextMenu.x, window.innerWidth - 260),
          }}
        >
          {contextMenu.type === 'tab' ? (
            <>
              <div
                className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex flex-col group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorSubmenu(!showColorSubmenu);
                  setShowSplitSubmenu(false);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3"><Palette size={14} /> Change tab color</div>
                  <ChevronDown size={14} className={cn('transition-transform opacity-40', showColorSubmenu ? 'rotate-0' : '-rotate-90')} />
                </div>
                {showColorSubmenu && (
                  <div className="grid grid-cols-8 gap-1 pt-2 pb-1 animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setTabColor(activeProjectId, contextMenu.targetId, c.value)}
                        className="w-5 h-5 rounded-full border border-[var(--cornflower)] flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ backgroundColor: c.value || 'transparent' }}
                        title={c.name}
                      >
                        {!c.value && <X size={10} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => startRenaming(contextMenu.targetId, activeProject?.tabs?.find((t) => t.id === contextMenu.targetId)?.title || '')}
                className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3"
              >
                <Type size={14} /> Rename tab
              </button>
              <button onClick={() => duplicateTab(activeProjectId, contextMenu.targetId)} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <Copy size={14} /> Duplicate tab
              </button>

              {(activeProject?.tabs?.find((t) => t.id === contextMenu.targetId)?.panes?.length ?? 0) > 1 && (
                <button onClick={() => unsplitTab(activeProjectId, contextMenu.targetId)} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                  <Columns size={14} /> Unsplit into tabs
                </button>
              )}

              <div
                className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex flex-col group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSplitSubmenu(!showSplitSubmenu);
                  setShowColorSubmenu(false);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3"><Columns size={14} /> Split tab with...</div>
                  <ChevronDown size={14} className={cn('transition-transform opacity-40', showSplitSubmenu ? 'rotate-0' : '-rotate-90')} />
                </div>
                {showSplitSubmenu && (
                  <div className="flex flex-col gap-1 mt-2 pl-6 border-l border-[var(--cornflower)]/30 animate-in fade-in slide-in-from-top-1 duration-200">
                    {activeProject?.tabs
                      .filter((t) => t.id !== contextMenu.targetId)
                      .map((t) => (
                        <button
                          key={t.id}
                          onClick={() => splitTab(activeProjectId, contextMenu.targetId, t.id)}
                          className="text-left py-1 opacity-60 hover:opacity-100 truncate flex items-center gap-2"
                        >
                          <TerminalIcon size={10} /> {t.title}
                        </button>
                      ))}
                    <button
                      onClick={() => splitTab(activeProjectId, contextMenu.targetId)}
                      className="text-left py-1 text-[var(--charcoal)] font-semibold mt-1 border-t border-[var(--cornflower)]/10 pt-1"
                    >
                      + create new pane
                    </button>
                  </div>
                )}
              </div>

              <div className="flex border-b border-[var(--cornflower)]/30">
                <button onClick={() => moveTab(activeProjectId, contextMenu.targetId, 'left')} className="flex-1 px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                  <ArrowLeft size={14} /> Move Left
                </button>
                <button onClick={() => moveTab(activeProjectId, contextMenu.targetId, 'right')} className="flex-1 px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 border-l border-[var(--cornflower)]/30">
                  <ArrowRight size={14} /> Move Right
                </button>
              </div>
              <button onClick={exportWorkspace} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <Download size={14} /> Export workspace
              </button>
              <button onClick={() => { setShowFind(true); setContextMenu(null); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 border-b border-[var(--cornflower)]/30 pb-2">
                <Search size={14} /> Find
              </button>
              <button onClick={() => removeTab(activeProjectId, contextMenu.targetId)} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 text-red-500 font-semibold">
                <X size={14} /> Close tab
              </button>
            </>
          ) : contextMenu.type === 'terminal' ? (
            <>
              <button onClick={() => { handleCopy(); setContextMenu(null); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <Clipboard size={14} /> Copy
              </button>
              <button onClick={() => { handlePaste(); setContextMenu(null); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <ClipboardPaste size={14} /> Paste
              </button>
              <button onClick={() => { handleSelectAll(); setContextMenu(null); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <List size={14} /> Select all
              </button>
              <button onClick={() => { setShowFind(true); setContextMenu(null); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <Search size={14} /> Find
              </button>
            </>
          ) : (
            <>
              <button onClick={() => startRenaming(contextMenu.targetId, projects.find((p) => p.id === contextMenu.targetId)?.name || '')} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
                <Edit3 size={14} /> Rename project
              </button>
              <button onClick={() => removeProject(contextMenu.targetId)} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 text-red-500">
                <Trash2 size={14} /> Delete project
              </button>
            </>
          )}
        </div>
      )}

      {showPalette && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-xl bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-4 border-b border-[var(--cornflower)] flex items-center gap-3">
              <Search size={18} className="text-[var(--charcoal)] opacity-70" />
              <input
                ref={paletteInputRef}
                autoFocus
                placeholder="search commands..."
                className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--charcoal)]/40 text-[var(--charcoal)]"
                value={paletteSearch}
                onChange={(e) => {
                  setPaletteSearch(e.target.value);
                  setPaletteIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPaletteIndex((prev) => (prev + 1) % paletteActions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPaletteIndex((prev) => (prev - 1 + paletteActions.length) % paletteActions.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    runPaletteAction(paletteIndex);
                  }
                }}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto p-1">
              {paletteActions.length > 0 ? (
                paletteActions.map((action, idx) => (
                  <button
                    key={action.label}
                    onClick={() => action.action()}
                    onMouseEnter={() => setPaletteIndex(idx)}
                    className={cn(
                      'w-full px-4 py-3 flex items-center justify-between gap-3 text-sm transition-colors rounded-sm',
                      paletteIndex === idx ? 'bg-[var(--cornflower)] text-[var(--charcoal)]' : 'text-[var(--charcoal)] opacity-60 hover:opacity-100 hover:bg-[var(--cornflower)]/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon}
                      <span className="lowercase">{action.label}</span>
                    </div>
                    <span className="text-[10px] opacity-30 uppercase tracking-widest">{action.category}</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-[var(--charcoal)] opacity-40 italic">no commands found</div>
              )}
            </div>
          </div>
        </div>
      )}

      <aside
        className={cn('relative transition-all duration-300 ease-in-out z-40', sidebarCollapsed ? 'w-14' : 'w-64')}
        onMouseEnter={() => sidebarCollapsed && setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div
          className={cn(
            'flex flex-col h-full bg-[var(--start)] border-r border-[var(--cornflower)] transition-all duration-300 ease-in-out overflow-hidden',
            sidebarCollapsed && sidebarHovered ? 'absolute w-64 shadow-2xl' : 'w-full'
          )}
        >
          <div className={cn('p-3 border-b border-[var(--cornflower)] flex items-center', sidebarCollapsed && !sidebarHovered ? 'justify-center' : 'justify-between')}>
            {(!sidebarCollapsed || sidebarHovered) && (
              <h1 className="text-sm font-semibold tracking-tight lowercase animate-in fade-in duration-300">projects</h1>
            )}
            <button onClick={addProject} className="p-1 hover:bg-[var(--cornflower)] rounded-sm transition-colors text-[var(--charcoal)] opacity-60 hover:opacity-100">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {projects.map((p, idx) => (
              <div
                key={p.id}
                onDoubleClick={() => (!sidebarCollapsed || sidebarHovered) && startRenaming(p.id, p.name)}
                onContextMenu={(e) => handleContextMenu(e, 'project', p.id)}
                onClick={() => {
                  setActiveProjectId(p.id);
                  if (p.tabs.length > 0) setActiveTab(p.tabs[0].id);
                  setCurrentView('terminal');
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 py-2 text-sm rounded-sm transition-colors text-left cursor-pointer group',
                  sidebarCollapsed && !sidebarHovered ? 'justify-center px-0' : 'justify-between px-3',
                  activeProjectId === p.id ? 'bg-[var(--cornflower)] text-[var(--charcoal)]' : 'hover:bg-[var(--cornflower)]/50'
                )}
                title={sidebarCollapsed && !sidebarHovered ? p.name : undefined}
              >
                <div className={cn('flex items-center gap-2 truncate', sidebarCollapsed && !sidebarHovered && 'justify-center')}>
                  <Folder size={14} className={activeProjectId === p.id ? 'text-[var(--charcoal)]' : 'text-[var(--charcoal)] opacity-40'} />
                  {(!sidebarCollapsed || sidebarHovered) && (
                    editingId === p.id ? (
                      <input
                        autoFocus
                        className="bg-transparent border-none outline-none text-[var(--charcoal)] w-full lowercase"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleRenameProject(p.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameProject(p.id)}
                      />
                    ) : (
                      <span className="lowercase truncate animate-in fade-in duration-300">{p.name}</span>
                    )
                  )}
                </div>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="text-[10px] opacity-30 group-hover:opacity-100 transition-opacity animate-in fade-in duration-300">Alt+{idx + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="h-10 border-b border-[var(--cornflower)] flex items-center bg-[var(--start)] relative select-none z-30">
          <div ref={tabStripRef} className="flex-1 flex overflow-x-auto no-scrollbar app-region-drag h-full items-center min-w-0">
            {activeProject?.tabs.map((t, idx) => (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => {
                  setDraggingTabId(t.id);
                  e.dataTransfer.setData('text/tab', t.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  if (!draggingTabId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromId = draggingTabId || e.dataTransfer.getData('text/tab');
                  reorderTabs(activeProjectId, fromId, t.id);
                  setDraggingTabId(null);
                }}
                onDragEnd={() => setDraggingTabId(null)}
                onDoubleClick={() => startRenaming(t.id, t.title)}
                onContextMenu={(e) => handleContextMenu(e, 'tab', t.id)}
                onClick={() => {
                  setActiveTab(t.id);
                  setCurrentView('terminal');
                }}
                className={cn(
                  'h-full px-4 flex items-center gap-2 text-xs border-r border-[var(--cornflower)] transition-colors relative flex-shrink-0 app-region-no-drag cursor-pointer group',
                  compactTabs ? 'min-w-[120px] max-w-[200px]' : 'min-w-max',
                  activeTabId === t.id && currentView === 'terminal'
                    ? 'bg-[var(--cornflower)]/30 text-[var(--charcoal)]'
                    : 'text-[var(--charcoal)] opacity-40 hover:opacity-100 hover:bg-[var(--cornflower)]/20',
                  draggingTabId === t.id && 'opacity-60'
                )}
              >
                <GripVertical size={10} className="opacity-30" />
                {t.panes.length > 1 ? (
                  <div className="flex items-center gap-1">
                    <TerminalIcon size={12} className="text-[var(--charcoal)] opacity-60" />
                    <div className="flex items-center gap-0.5">
                      {getSplitTitleParts(t).slice(0, 3).map((p) => (
                        <span
                          key={p.title}
                          className="w-2 h-2 rounded-full border border-[var(--cornflower)]/40"
                          style={{ backgroundColor: p.color || 'transparent' }}
                          title={p.title}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <TerminalIcon size={12} style={{ color: t.color }} />
                )}
                {t.panes.length > 1 && (
                  <Columns size={10} className="text-[var(--charcoal)] opacity-40 -ml-1" />
                )}
                {editingId === t.id ? (
                  <input
                    autoFocus
                    className="bg-transparent border-none outline-none text-[var(--charcoal)] w-full lowercase"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameTab(activeProjectId, t.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameTab(activeProjectId, t.id)}
                  />
                ) : (
                  <span className={cn('lowercase flex-1', compactTabs && 'truncate')}>
                    {renderTabLabel(t)}
                  </span>
                )}

                {tabActivity[t.id] && (
                  <span className="w-2 h-2 rounded-full bg-[var(--alert)]" title="activity" />
                )}

                <div className="flex items-center gap-1">
                  <span className="text-[10px] opacity-0 group-hover:opacity-30 transition-opacity">^{idx + 1}</span>
                  <X
                    size={12}
                    className="hover:text-[var(--charcoal)] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => removeTab(activeProjectId, t.id, e)}
                  />
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 transition-colors duration-200"
                  style={{
                    backgroundColor: activeTabId === t.id
                      ? (t.panes.length > 1 ? 'transparent' : (t.color || 'var(--charcoal)'))
                      : 'transparent',
                  }}
                />

                {t.panes.length > 1 && activeTabId === t.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: (() => {
                        const parts = getSplitTitleParts(t);
                        const a = parts[0]?.color || 'transparent';
                        const b = parts[1]?.color || a;
                        return `linear-gradient(90deg, ${a} 0%, ${a} 50%, ${b} 50%, ${b} 100%)`;
                      })(),
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="relative flex-shrink-0 flex items-center h-10 app-region-no-drag border-r border-[var(--cornflower)]" ref={menuRef}>
            <button onClick={() => addTab(activeProjectId)} className="px-3 h-10 hover:bg-[var(--cornflower)]/30 text-[var(--charcoal)] opacity-60 hover:opacity-100">
              <Plus size={14} />
            </button>
            <button onClick={() => setShowShellMenu(!showShellMenu)} className="px-2 h-10 hover:bg-[var(--cornflower)]/30 text-[var(--charcoal)] opacity-60 hover:opacity-100 border-l border-[var(--cornflower)]/30">
              <ChevronDown size={14} />
            </button>

            {showShellMenu && (
              <div className="absolute top-10 right-0 w-64 bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl z-[100] py-1">
                {profiles.map((profile, idx) => (
                  <button
                    key={profile.id}
                    onClick={() => addTab(activeProjectId, profile.id)}
                    className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] text-[var(--charcoal)] opacity-70 hover:opacity-100 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Command size={12} />
                      <span className="lowercase">{profile.name}</span>
                    </div>
                    {idx < 3 && <span className="text-[10px] opacity-50 uppercase">Ctrl+Shift+{idx + 1}</span>}
                  </button>
                ))}
                <div className="h-[1px] bg-[var(--cornflower)] my-1 mx-2" />
                <button onClick={() => { setCurrentView('settings'); setShowShellMenu(false); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] text-[var(--charcoal)] opacity-70 hover:opacity-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <Maximize2 size={12} className="rotate-45" />
                    <span className="lowercase">settings</span>
                  </div>
                  <span className="text-[10px] opacity-50 uppercase">Ctrl+,</span>
                </button>
                <button onClick={() => { setShowPalette(true); setShowShellMenu(false); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] text-[var(--charcoal)] opacity-70 hover:opacity-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <Plus size={12} className="rotate-45" />
                    <span className="lowercase">command palette</span>
                  </div>
                  <span className="text-[10px] opacity-50 uppercase">Ctrl+Shift+P</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center h-10 app-region-no-drag">
            <button onClick={toggleTheme} className="px-3 h-10 hover:bg-[var(--cornflower)]/30 text-[var(--charcoal)] opacity-60 hover:opacity-100" title="toggle theme">
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <div className="px-4 flex gap-4 text-[var(--charcoal)] opacity-60">
              <Minimize2 size={14} className="cursor-pointer hover:opacity-100" onClick={() => window.terminalAPI.minimize()} />
              <Maximize2 size={14} className="cursor-pointer hover:opacity-100" onClick={() => window.terminalAPI.maximize()} />
              <X size={14} className="cursor-pointer hover:opacity-100" onClick={() => window.terminalAPI.close()} />
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-[var(--start)] overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />

          <div className="absolute inset-0">
            {showFind && currentView === 'terminal' && (
              <TerminalSearchBar
                value={findQuery}
                onChange={(val) => setFindQuery(val)}
                onNext={runFindNext}
                onPrev={runFindPrev}
                onClose={closeFind}
              />
            )}
            {projects.map((project) =>
              project.tabs.map((tab) => {
                const isVisible = project.id === activeProjectId && tab.id === activeTabId && currentView === 'terminal';
                const sizes = tab.paneSizes && tab.paneSizes.length === tab.panes.length
                  ? tab.paneSizes
                  : tab.panes.map(() => 100 / Math.max(1, tab.panes.length));
                return (
                  <div
                    key={`${project.id}-${tab.id}`}
                    style={{ display: isVisible ? 'flex' : 'none' }}
                    className="absolute inset-0 flex flex-row w-full h-full overflow-hidden"
                    ref={isVisible ? paneContainerRef : undefined}
                  >
                    {tab.panes.map((pane, idx) => {
                      const { shell, args, cwd } = resolvePaneConfig(pane);
                      const isActivePane = tab.activePaneId ? tab.activePaneId === pane.id : idx === 0;
                      return (
                        <React.Fragment key={pane.id}>
                          <div
                            className={cn('h-full relative overflow-hidden', isActivePane && 'pane-active')}
                            style={{ flex: `0 0 ${sizes[idx]}%` }}
                            onClick={() => activatePane(project.id, tab.id, pane.id, true)}
                            onContextMenu={(e) => {
                              activatePane(project.id, tab.id, pane.id, false);
                              handleContextMenu(e, 'terminal', pane.id);
                            }}
                          >
                            <TerminalView
                              id={pane.id}
                              shell={shell}
                              args={args}
                              cwd={cwd}
                              theme={theme}
                              isActive={isActivePane && isVisible}
                              isVisible={isVisible}
                              onExit={() => removePane(project.id, tab.id, pane.id)}
                              onActivity={() => handleActivity(pane.id)}
                              onSizeChange={(size) => setPaneSizesMap((prev) => ({ ...prev, [pane.id]: size }))}
                              onReady={(id, api) => terminalApis.current.set(id, api)}
                              onDispose={(id) => terminalApis.current.delete(id)}
                            />
                          </div>
                          {idx < tab.panes.length - 1 && (
                            <div className="pane-resizer" onMouseDown={(e) => startResize(e, tab.id, idx)} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })
            )}

            {(!activeTab || activeTab.panes.length === 0) && currentView === 'terminal' && (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--charcoal)] opacity-30 lowercase italic">
                no active terminals. press Ctrl+Shift+1 to open one.
              </div>
            )}
          </div>

          {currentView === 'settings' && (
            <div className="absolute inset-0 p-8 overflow-y-auto bg-[var(--start)] z-20">
              <h2 className="text-xl font-bold mb-6 text-[var(--charcoal)] lowercase text-opacity-100">settings</h2>
              <div className="max-w-2xl space-y-8">
                <section>
                  <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">profiles</h3>
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="p-3 bg-[var(--start)] border border-[var(--cornflower)] rounded-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm lowercase">{profile.name}</span>
                          <span className="text-[10px] uppercase opacity-40">{profile.editable ? 'editable' : 'default'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <input
                            disabled={!profile.editable}
                            className="bg-transparent border border-[var(--cornflower)] px-2 py-1 rounded-sm"
                            placeholder="shell"
                            value={profile.shell}
                            onChange={(e) => updateProfile(profile.id, { shell: e.target.value })}
                          />
                          <input
                            disabled={!profile.editable}
                            className="bg-transparent border border-[var(--cornflower)] px-2 py-1 rounded-sm"
                            placeholder="args"
                            value={profile.args.join(' ')}
                            onChange={(e) => updateProfile(profile.id, { args: e.target.value.split(' ').filter(Boolean) })}
                          />
                          <input
                            disabled={!profile.editable}
                            className="bg-transparent border border-[var(--cornflower)] px-2 py-1 rounded-sm"
                            placeholder="cwd"
                            value={profile.cwd}
                            onChange={(e) => updateProfile(profile.id, { cwd: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">appearance</h3>
                  <div className="flex gap-2">
                    {THEME_ORDER.map((name) => (
                      <button
                        key={name}
                        onClick={() => setTheme(name)}
                        className={cn(
                          'px-4 py-2 rounded-sm text-xs uppercase tracking-wider border border-[var(--cornflower)]',
                          theme === name ? 'bg-[var(--cornflower)]/40' : 'hover:bg-[var(--cornflower)]/20'
                        )}
                      >
                        {THEME_LABELS[name]}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">workspace</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportWorkspace}
                      className="px-4 py-2 bg-[var(--cornflower)]/20 hover:bg-[var(--cornflower)]/40 rounded-sm text-sm lowercase transition-colors"
                    >
                      export
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[var(--cornflower)]/20 hover:bg-[var(--cornflower)]/40 rounded-sm text-sm lowercase transition-colors"
                    >
                      import
                    </button>
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">help</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowOnboarding(true);
                        setOnboardingStep(0);
                        setCurrentView('terminal');
                      }}
                      className="px-4 py-2 bg-[var(--cornflower)]/20 hover:bg-[var(--cornflower)]/40 rounded-sm text-sm lowercase transition-colors"
                    >
                      restart welcome tour
                    </button>
                    <button
                      onClick={resetState}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-sm text-sm lowercase transition-colors"
                    >
                      reset app state
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

        <StatusBar
          projectName={activeProject?.name}
          tabTitle={activeTab?.title}
          profileName={resolvePaneConfig(activePane).profile.name}
          cwd={resolvePaneConfig(activePane).cwd || '~'}
          cols={activePaneId ? paneSizesMap[activePaneId]?.cols : undefined}
          rows={activePaneId ? paneSizesMap[activePaneId]?.rows : undefined}
          isConnected={Boolean(activePaneId)}
        />
      </main>
    </div>
  );
};

export default App;


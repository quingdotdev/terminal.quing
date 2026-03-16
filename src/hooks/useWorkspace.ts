import { useState, useRef, useEffect, useCallback } from 'react';
import { loadWorkspace, saveWorkspace, normalizeWorkspace, DEFAULT_PROFILES } from '../state/workspace';
import type { Project, TerminalTab, Pane, Profile } from '../state/types';
import type { ThemeName } from '../state/themes';

const randomId = () => Math.random().toString(36).slice(2, 9);

/**
 * Custom hook to manage the terminal workspace state.
 * Handles projects, tabs, panes, profiles, themes, and persistence to localStorage.
 * 
 * @returns An object containing workspace state and functions to manipulate it.
 */
export const useWorkspace = () => {
  const initialWorkspace = loadWorkspace();

  const [projects, setProjects] = useState<Project[]>(initialWorkspace.projects);
  const [profiles, setProfiles] = useState<Profile[]>(initialWorkspace.profiles);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialWorkspace.activeProjectId);
  const [activeTabId, setActiveTabId] = useState<string>(initialWorkspace.activeTabId);
  const [theme, setTheme] = useState<ThemeName>(initialWorkspace.theme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialWorkspace.sidebarCollapsed);
  const [tabActivity, setTabActivity] = useState<Record<string, boolean>>({});

  // Reference to terminal API instances for direct manipulation (focus, find, etc.)
  const terminalApis = useRef<Map<string, any>>(new Map());

  // Automatically save workspace changes to localStorage
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

  /**
   * Retrieves a profile by ID or returns a default fallback.
   */
  const getProfileById = useCallback((profileId?: string) => {
    return profiles.find((p) => p.id === profileId) || profiles[0] || DEFAULT_PROFILES[0];
  }, [profiles]);

  /**
   * Sets the active tab and clears its activity indicator.
   */
  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setTabActivity((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
  }, []);

  /**
   * Activates a specific pane within a tab and project.
   * Optionally focuses the terminal.
   */
  const activatePane = useCallback((projectId: string, tabId: string, paneId: string, focus = true) => {
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
  }, []);

  /**
   * Adds a new tab to a project using a specific profile.
   */
  const addTab = useCallback((projectId: string, profileId?: string) => {
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
  }, [getProfileById, setActiveTab]);

  /**
   * Splits a tab by adding a new pane or moving panes from another tab.
   */
  const splitTab = useCallback((projectId: string, targetTabId: string, sourceTabId?: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const targetTab = p.tabs.find((t) => t.id === targetTabId);
        if (!targetTab) return p;

        let newPanes: any[] = [...targetTab.panes].map((pane) => ({
          ...pane,
          title: pane.title || targetTab.title || 'terminal',
          color: pane.color ?? targetTab.color,
        }));
        let newTabs = [...p.tabs];

        if (sourceTabId) {
          // Move panes from sourceTab to targetTab
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
          // Add a fresh pane to targetTab
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
    setActiveTab(targetTabId);
  }, [getProfileById, setActiveTab]);

  /**
   * Explodes a split tab back into individual tabs.
   */
  const unsplitTab = useCallback((projectId: string, tabId: string) => {
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
  }, []);

  /**
   * Reorders a tab within its project.
   */
  const moveTab = useCallback((projectId: string, tabId: string, direction: 'left' | 'right') => {
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
  }, []);

  /**
   * Drag-and-drop tab reordering.
   */
  const reorderTabs = useCallback((projectId: string, fromId: string, toId: string) => {
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
  }, []);

  /**
   * Sets the theme color for a specific tab.
   */
  const setTabColor = useCallback((projectId: string, tabId: string, color?: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        
        const updatedTabs = p.tabs.map((t) => {
          if (t.id !== tabId) return t;
          const next = { ...t, color };
          if (t.panes.length === 1) {
            next.panes = [{ ...t.panes[0], color }];
          }
          return next;
        });

        return { ...p, tabs: updatedTabs };
      })
    );
  }, []);

  /**
   * Closes a tab. If it's the active tab, switch to another.
   */
  const removeTab = useCallback((projectId: string, tabId: string, e?: React.MouseEvent) => {
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
  }, [activeTabId, setActiveTab]);

  /**
   * Closes a single pane within a tab. 
   * If it's the last pane, the tab itself is removed.
   */
  const removePane = useCallback((projectId: string, tabId: string, paneId: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== projectId) return p;

        const updatedTabs = p.tabs.map((t) => {
          if (t.id !== tabId) return t;
          const remainingPanes = t.panes.filter((pane) => pane.id !== paneId);
          const nextActivePaneId = t.activePaneId === paneId ? remainingPanes[0]?.id : t.activePaneId;
          const paneSizes = remainingPanes.length > 0 ? remainingPanes.map(() => 100 / remainingPanes.length) : [];
          return { ...t, panes: remainingPanes, paneSizes, activePaneId: nextActivePaneId };
        });

        return { ...p, tabs: updatedTabs };
      });

      const project = updated.find((p) => p.id === projectId);
      const tab = project?.tabs.find((t) => t.id === tabId);
      if (tab && tab.panes.length === 0) {
        return updated.map((p) => (p.id === projectId ? { ...p, tabs: p.tabs.filter((t) => t.id !== tabId) } : p));
      }
      return updated;
    });
  }, []);

  /**
   * Deletes a project.
   */
  const removeProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      if (projectId === activeProjectId && remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
        if (remaining[0].tabs.length > 0) setActiveTab(remaining[0].tabs[0].id);
      }
      return remaining;
    });
  }, [activeProjectId, setActiveTab]);

  /**
   * Clones an existing tab.
   */
  const duplicateTab = useCallback((projectId: string, tabId: string) => {
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
  }, [setActiveTab]);

  /**
   * Scaffolds a new project with a default tab.
   */
  const addProject = useCallback(() => {
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
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(id);
    setActiveTab(tabId);
  }, [getProfileById, projects.length, setActiveTab]);

  /**
   * Updates a project's display name.
   */
  const handleRenameProject = useCallback((id: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: name || p.name } : p)));
  }, []);

  /**
   * Updates a tab's display name.
   */
  const handleRenameTab = useCallback((projectId: string, tabId: string, title: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        const updatedTabs = p.tabs.map((t) => {
          if (t.id !== tabId) return t;
          const nextTitle = title || t.title;
          const panes = t.panes.length === 1 ? [{ ...t.panes[0], title: nextTitle }] : t.panes;
          return { ...t, title: nextTitle, panes };
        });

        return { ...p, tabs: updatedTabs };
      })
    );
  }, []);

  /**
   * Wipes all local state and returns to a fresh workspace.
   */
  const resetWorkspace = useCallback(() => {
    localStorage.clear();
    const fresh = normalizeWorkspace({});
    setProjects(fresh.projects);
    setProfiles(fresh.profiles);
    setActiveProjectId(fresh.activeProjectId);
    setActiveTabId(fresh.activeTabId);
    setTheme(fresh.theme);
    setSidebarCollapsed(fresh.sidebarCollapsed);
  }, []);

  /**
   * Modifies a shell profile (path, args, cwd).
   */
  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  /**
   * Replaces current workspace with data from an imported JSON file.
   */
  const importWorkspace = useCallback((data: any) => {
    const normalized = normalizeWorkspace(data);
    setProjects(normalized.projects);
    setProfiles(normalized.profiles);
    setActiveProjectId(normalized.activeProjectId);
    setActiveTabId(normalized.activeTabId);
    setTheme(normalized.theme);
    setSidebarCollapsed(normalized.sidebarCollapsed);
  }, []);

  /**
   * Marks a tab as having "activity" (e.g., terminal output) if it's not currently focused.
   */
  const handleActivity = useCallback((paneId: string, projects: Project[], activeTab: TerminalTab | undefined, activePaneId: string | undefined, currentView: string) => {
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
  }, []);

  return {
    projects,
    setProjects,
    profiles,
    activeProjectId,
    setActiveProjectId,
    activeTabId,
    setActiveTabId,
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
  };
};

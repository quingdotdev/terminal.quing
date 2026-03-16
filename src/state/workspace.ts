import type { Profile, Project, TerminalTab, Pane, WorkspaceState } from './types';
import { THEME_FAMILIES, type ThemeFamily } from './themes';

const STORAGE_KEY = 'workspace';
const STORAGE_VERSION = 2;
const DEFAULT_TERMINAL_FONT_FAMILY =
  "'JetBrains Mono', 'Cascadia Mono', 'Cascadia Code', Consolas, 'Courier New', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";

/**
 * Default shell profiles provided by the application.
 */
export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'powershell',
    name: 'powershell',
    shell: 'powershell.exe',
    args: ['-NoLogo'],
    cwd: '',
    editable: false,
  },
  {
    id: 'cmd',
    name: 'command prompt',
    shell: 'cmd.exe',
    args: [],
    cwd: '',
    editable: false,
  },
  {
    id: 'bash',
    name: 'bash',
    shell: 'bash.exe',
    args: [],
    cwd: '',
    editable: false,
  },
  {
    id: 'custom',
    name: 'custom',
    shell: 'powershell.exe',
    args: [],
    cwd: '',
    editable: true,
  },
];

const DEFAULT_THEME: ThemeFamily = 'default';

/**
 * Ensures a theme name is valid, otherwise returns the default.
 */
const normalizeTheme = (value: any): ThemeFamily => {
  return THEME_FAMILIES.includes(value) ? value : DEFAULT_THEME;
};

/**
 * Restricts a number to be within a specific range.
 */
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Ensures profiles list is valid and contains at least one editable custom profile.
 */
const normalizeProfiles = (profiles?: Profile[]) => {
  const base = Array.isArray(profiles) && profiles.length > 0 ? profiles : DEFAULT_PROFILES;
  const normalized = base.map((p) => ({
    id: p.id,
    name: p.name || p.id,
    shell: p.shell || 'powershell.exe',
    args: Array.isArray(p.args) ? p.args : [],
    cwd: p.cwd ?? '',
    editable: Boolean(p.editable),
  }));
  const hasCustom = normalized.some((p) => p.editable);
  if (!hasCustom) {
    normalized.push({ ...DEFAULT_PROFILES[DEFAULT_PROFILES.length - 1] });
  }
  return normalized;
};

/**
 * Attempts to find a profile ID that matches a given shell executable path.
 */
const findProfileIdForShell = (profiles: Profile[], shell?: string) => {
  if (!shell) return profiles[0]?.id;
  const match = profiles.find((p) => p.shell.toLowerCase() === shell.toLowerCase());
  return match?.id || profiles.find((p) => p.editable)?.id || profiles[0]?.id;
};

/**
 * Normalizes a Pane object, ensuring all required fields are present.
 */
const normalizePane = (pane: any, tab: TerminalTab, profiles: Profile[]): Pane => {
  const shell = pane?.shell || tab?.panes?.[0]?.shell || 'powershell.exe';
  const profileId = pane?.profileId || findProfileIdForShell(profiles, shell);
  return {
    id: pane?.id || Math.random().toString(36).slice(2, 9),
    title: pane?.title || tab?.title || 'terminal',
    color: pane?.color ?? tab?.color,
    profileId,
    shell,
    args: Array.isArray(pane?.args) ? pane.args : undefined,
    cwd: pane?.cwd ?? undefined,
    lastActivityTs: pane?.lastActivityTs,
  };
};

/**
 * Normalizes a Tab object, ensuring panes and sizes are consistent.
 */
const normalizeTab = (tab: any, profiles: Profile[]): TerminalTab => {
  const panes = (Array.isArray(tab?.panes) ? tab.panes : [{ id: tab?.id, shell: tab?.shell }]).map((p: any) =>
    normalizePane(p, tab, profiles)
  );
  const paneSizes = Array.isArray(tab?.paneSizes) ? tab.paneSizes : [];
  const normalizedSizes =
    paneSizes.length === panes.length
      ? paneSizes.map((v: any) => clamp(Number(v) || 0, 5, 95))
      : panes.map(() => 100 / Math.max(1, panes.length));
  const activePaneId = tab?.activePaneId || panes[0]?.id;
  return {
    id: tab?.id || Math.random().toString(36).slice(2, 9),
    title: tab?.title || 'terminal',
    panes,
    color: tab?.color,
    paneSizes: normalizedSizes,
    activePaneId,
  };
};

/**
 * Normalizes a Project object.
 */
const normalizeProject = (project: any, profiles: Profile[]): Project => {
  const tabs = Array.isArray(project?.tabs) ? project.tabs : [];
  return {
    id: project?.id || Math.random().toString(36).slice(2, 9),
    name: project?.name || 'project',
    tabs: tabs.map((t: any) => normalizeTab(t, profiles)),
  };
};

/**
 * Orchestrates the normalization of the entire workspace state.
 * Handles migration from old versions and provides defaults for missing data.
 */
export const normalizeWorkspace = (raw: any): WorkspaceState => {
  const profiles = normalizeProfiles(raw?.profiles);
  const projects = Array.isArray(raw?.projects) ? raw.projects.map((p: any) => normalizeProject(p, profiles)) : [];
  const safeProjects = projects.length > 0 ? projects : [
    normalizeProject({
      id: '1',
      name: 'main',
      tabs: [
        {
          id: 't1',
          title: 'powershell',
          panes: [{ id: 't1', shell: 'powershell.exe', title: 'powershell', profileId: 'powershell' }],
        },
      ],
    }, profiles),
  ];
  const activeProjectId = raw?.activeProjectId || safeProjects[0]?.id;
  const activeProject = safeProjects.find((p: any) => p.id === activeProjectId) || safeProjects[0];
  const activeTabId = raw?.activeTabId || activeProject?.tabs?.[0]?.id;
  
  return {
    version: STORAGE_VERSION,
    projects: safeProjects,
    activeProjectId: activeProject?.id || activeProjectId,
    activeTabId: activeTabId || activeProject?.tabs?.[0]?.id,
    theme: normalizeTheme(raw?.theme),
    themeVariant: (raw?.themeVariant === 'light' || raw?.themeVariant === 'dark') ? raw.themeVariant : 'dark',
    terminalFontFamily: raw?.terminalFontFamily || DEFAULT_TERMINAL_FONT_FAMILY,
    terminalFontLigatures: typeof raw?.terminalFontLigatures === 'boolean' ? raw.terminalFontLigatures : true,
    profiles,
    sidebarCollapsed: Boolean(raw?.sidebarCollapsed),
  };
};

/**
 * Loads the workspace state from localStorage.
 * Includes support for legacy flat storage keys.
 */
export const loadWorkspace = (): WorkspaceState => {
  if (typeof window === 'undefined') {
    return normalizeWorkspace({});
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return normalizeWorkspace(parsed);
    } catch (_e) {
      return normalizeWorkspace({});
    }
  }
  
  // Legacy migration logic
  const legacyProjects = localStorage.getItem('projects');
  if (legacyProjects) {
    try {
      const parsed = JSON.parse(legacyProjects);
      return normalizeWorkspace({
        projects: Array.isArray(parsed) ? parsed : [],
        activeProjectId: localStorage.getItem('activeProjectId') || undefined,
        activeTabId: localStorage.getItem('activeTabId') || undefined,
        theme: localStorage.getItem('theme') || DEFAULT_THEME,
        sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
      });
    } catch (_e) {
      return normalizeWorkspace({});
    }
  }
  return normalizeWorkspace({});
};

/**
 * Persists the workspace state to localStorage.
 */
export const saveWorkspace = (state: WorkspaceState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_e) {
    // ignore quota errors
  }
};

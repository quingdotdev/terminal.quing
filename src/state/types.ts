export interface Profile {
  id: string;
  name: string;
  shell: string;
  args: string[];
  cwd: string;
  editable: boolean;
}

export interface Pane {
  id: string;
  title?: string;
  color?: string;
  profileId?: string;
  shell?: string;
  args?: string[];
  cwd?: string;
  lastActivityTs?: number;
}

export interface TerminalTab {
  id: string;
  title: string;
  panes: Pane[];
  color?: string;
  paneSizes?: number[];
  activePaneId?: string;
}

export interface Project {
  id: string;
  name: string;
  tabs: TerminalTab[];
}

export interface WorkspaceState {
  version: number;
  projects: Project[];
  activeProjectId: string;
  activeTabId: string;
  theme: string;
  themeVariant: 'light' | 'dark';
  terminalFontFamily: string;
  terminalFontLigatures: boolean;
  profiles: Profile[];
  sidebarCollapsed: boolean;
}

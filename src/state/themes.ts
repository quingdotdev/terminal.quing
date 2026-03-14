export type ThemeName = 'light' | 'dark' | 'dusk';

export const THEME_ORDER: ThemeName[] = ['light', 'dark', 'dusk'];

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'light',
  dark: 'dark',
  dusk: 'dusk',
};

export const XTERM_THEMES: Record<ThemeName, {
  background: string;
  foreground: string;
  cursor: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
}> = {
  light: {
    background: '#FFFFFF',
    foreground: '#0F172A',
    cursor: '#0F172A',
    selectionBackground: 'rgba(15, 23, 42, 0.1)',
    black: '#0F172A',
    red: '#EF4444',
    green: '#22C55E',
    yellow: '#EAB308',
    blue: '#2563EB',
    magenta: '#C026D3',
    cyan: '#0891B2',
    white: '#475569',
  },
  dark: {
    background: '#0F172A',
    foreground: '#F8FAFC',
    cursor: '#F8FAFC',
    selectionBackground: 'rgba(248, 250, 252, 0.3)',
    black: '#0F172A',
    red: '#EF4444',
    green: '#22C55E',
    yellow: '#EAB308',
    blue: '#3B82F6',
    magenta: '#D946EF',
    cyan: '#06B6D4',
    white: '#F8FAFC',
  },
  dusk: {
    background: '#0B1020',
    foreground: '#E2E8F0',
    cursor: '#E2E8F0',
    selectionBackground: 'rgba(148, 163, 184, 0.3)',
    black: '#0B1020',
    red: '#F97316',
    green: '#10B981',
    yellow: '#F59E0B',
    blue: '#38BDF8',
    magenta: '#F472B6',
    cyan: '#22D3EE',
    white: '#E2E8F0',
  },
};

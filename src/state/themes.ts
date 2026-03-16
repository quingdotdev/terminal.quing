export type ThemeVariant = 'light' | 'dark';

export type ThemeFamily = 
  | 'default' 
  | 'dusk' 
  | 'ocean' 
  | 'forest' 
  | 'crimson' 
  | 'amber' 
  | 'purple' 
  | 'sky' 
  | 'rose' 
  | 'mint' 
  | 'stone' 
  | 'sepia'
  | 'nord'
  | 'dracula'
  | 'gruvbox'
  | 'tokyo'
  | 'solarized'
  | 'monokai'
  | 'catppuccin'
  | 'everforest'
  | 'matrix'
  | 'paper';

export const THEME_FAMILIES: ThemeFamily[] = [
  'default',
  'dusk',
  'ocean',
  'forest',
  'crimson',
  'amber',
  'purple',
  'sky',
  'rose',
  'mint',
  'stone',
  'sepia',
  'nord',
  'dracula',
  'gruvbox',
  'tokyo',
  'solarized',
  'monokai',
  'catppuccin',
  'everforest',
  'matrix',
  'paper',
];

export const THEME_LABELS: Record<ThemeFamily, string> = {
  default: 'default',
  dusk: 'dusk',
  ocean: 'ocean',
  forest: 'forest',
  crimson: 'crimson',
  amber: 'amber',
  purple: 'purple',
  sky: 'sky',
  rose: 'rose',
  mint: 'mint',
  stone: 'stone',
  sepia: 'sepia',
  nord: 'nord',
  dracula: 'dracula',
  gruvbox: 'gruvbox',
  tokyo: 'tokyo',
  solarized: 'solarized',
  monokai: 'monokai',
  catppuccin: 'catppuccin',
  everforest: 'everforest',
  matrix: 'matrix',
  paper: 'paper',
};

export interface XTermColors {
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
}

export const XTERM_THEMES: Record<ThemeFamily, Record<ThemeVariant, XTermColors>> = {
  default: {
    light: {
      background: '#FFFFFF', foreground: '#0F172A', cursor: '#0F172A', selectionBackground: 'rgba(15, 23, 42, 0.1)',
      black: '#0F172A', red: '#EF4444', green: '#22C55E', yellow: '#EAB308', blue: '#2563EB', magenta: '#C026D3', cyan: '#0891B2', white: '#475569',
    },
    dark: {
      background: '#0F172A', foreground: '#F8FAFC', cursor: '#F8FAFC', selectionBackground: 'rgba(248, 250, 252, 0.3)',
      black: '#0F172A', red: '#EF4444', green: '#22C55E', yellow: '#EAB308', blue: '#3B82F6', magenta: '#D946EF', cyan: '#06B6D4', white: '#F8FAFC',
    }
  },
  dusk: {
    light: {
      background: '#F1F5F9', foreground: '#1E293B', cursor: '#1E293B', selectionBackground: 'rgba(30, 41, 59, 0.1)',
      black: '#1E293B', red: '#E11D48', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#64748B',
    },
    dark: {
      background: '#0B1020', foreground: '#E2E8F0', cursor: '#E2E8F0', selectionBackground: 'rgba(148, 163, 184, 0.3)',
      black: '#0B1020', red: '#F97316', green: '#10B981', yellow: '#F59E0B', blue: '#38BDF8', magenta: '#F472B6', cyan: '#22D3EE', white: '#E2E8F0',
    }
  },
  ocean: {
    light: {
      background: '#F0F9FF', foreground: '#075985', cursor: '#075985', selectionBackground: 'rgba(7, 89, 133, 0.1)',
      black: '#075985', red: '#E11D48', green: '#059669', yellow: '#D97706', blue: '#0284C7', magenta: '#7C3AED', cyan: '#0891B2', white: '#38BDF8',
    },
    dark: {
      background: '#082F49', foreground: '#E0F2FE', cursor: '#E0F2FE', selectionBackground: 'rgba(224, 242, 254, 0.2)',
      black: '#082F49', red: '#FB7185', green: '#34D399', yellow: '#FBBF24', blue: '#38BDF8', magenta: '#A78BFA', cyan: '#22D3EE', white: '#E0F2FE',
    }
  },
  forest: {
    light: {
      background: '#F0FDF4', foreground: '#166534', cursor: '#166534', selectionBackground: 'rgba(22, 101, 52, 0.1)',
      black: '#166534', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#4ADE80',
    },
    dark: {
      background: '#064E3B', foreground: '#ECFDF5', cursor: '#ECFDF5', selectionBackground: 'rgba(236, 253, 245, 0.2)',
      black: '#064E3B', red: '#F87171', green: '#10B981', yellow: '#FBBF24', blue: '#34D399', magenta: '#D946EF', cyan: '#2DD4BF', white: '#ECFDF5',
    }
  },
  crimson: {
    light: {
      background: '#FFF1F2', foreground: '#9F1239', cursor: '#9F1239', selectionBackground: 'rgba(159, 18, 57, 0.1)',
      black: '#9F1239', red: '#E11D48', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#FB7185',
    },
    dark: {
      background: '#4C0519', foreground: '#FFF1F2', cursor: '#FFF1F2', selectionBackground: 'rgba(255, 241, 242, 0.2)',
      black: '#4C0519', red: '#FB7185', green: '#34D399', yellow: '#FBBF24', blue: '#F43F5E', magenta: '#F472B6', cyan: '#FB923C', white: '#FFF1F2',
    }
  },
  amber: {
    light: {
      background: '#FFFBEB', foreground: '#92400E', cursor: '#92400E', selectionBackground: 'rgba(146, 64, 14, 0.1)',
      black: '#92400E', red: '#DC2626', green: '#16A34A', yellow: '#D97706', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#FBBF24',
    },
    dark: {
      background: '#451A03', foreground: '#FEF3C7', cursor: '#FEF3C7', selectionBackground: 'rgba(254, 243, 199, 0.2)',
      black: '#451A03', red: '#F87171', green: '#34D399', yellow: '#FBBF24', blue: '#F59E0B', magenta: '#FB923C', cyan: '#FCD34D', white: '#FEF3C7',
    }
  },
  purple: {
    light: {
      background: '#FAF5FF', foreground: '#6B21A8', cursor: '#6B21A8', selectionBackground: 'rgba(107, 33, 168, 0.1)',
      black: '#6B21A8', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#C084FC',
    },
    dark: {
      background: '#2E1065', foreground: '#F5F3FF', cursor: '#F5F3FF', selectionBackground: 'rgba(245, 243, 255, 0.2)',
      black: '#2E1065', red: '#FB7185', green: '#34D399', yellow: '#FBBF24', blue: '#8B5CF6', magenta: '#D946EF', cyan: '#A78BFA', white: '#F5F3FF',
    }
  },
  sky: {
    light: {
      background: '#F0F9FF', foreground: '#0C4A6E', cursor: '#0C4A6E', selectionBackground: 'rgba(12, 74, 110, 0.1)',
      black: '#0C4A6E', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#0284C7', magenta: '#9333EA', cyan: '#0891B2', white: '#7DD3FC',
    },
    dark: {
      background: '#0C4A6E', foreground: '#F0F9FF', cursor: '#F0F9FF', selectionBackground: 'rgba(240, 249, 255, 0.2)',
      black: '#0C4A6E', red: '#F87171', green: '#34D399', yellow: '#FBBF24', blue: '#38BDF8', magenta: '#F472B6', cyan: '#7DD3FC', white: '#F0F9FF',
    }
  },
  rose: {
    light: {
      background: '#FFF1F2', foreground: '#9F1239', cursor: '#9F1239', selectionBackground: 'rgba(159, 18, 57, 0.1)',
      black: '#9F1239', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#E11D48', magenta: '#9333EA', cyan: '#0891B2', white: '#FDA4AF',
    },
    dark: {
      background: '#881337', foreground: '#FFF1F2', cursor: '#FFF1F2', selectionBackground: 'rgba(255, 241, 242, 0.2)',
      black: '#881337', red: '#FB7185', green: '#34D399', yellow: '#FBBF24', blue: '#F43F5E', magenta: '#F472B6', cyan: '#FDA4AF', white: '#FFF1F2',
    }
  },
  mint: {
    light: {
      background: '#F0FDFA', foreground: '#0D9488', cursor: '#0D9488', selectionBackground: 'rgba(13, 148, 136, 0.1)',
      black: '#0D9488', red: '#DC2626', green: '#059669', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#5EEAD4',
    },
    dark: {
      background: '#134E4A', foreground: '#F0FDFA', cursor: '#F0FDFA', selectionBackground: 'rgba(240, 253, 250, 0.2)',
      black: '#134E4A', red: '#F87171', green: '#2DD4BF', yellow: '#FBBF24', blue: '#5EEAD4', magenta: '#F472B6', cyan: '#2DD4BF', white: '#F0FDFA',
    }
  },
  stone: {
    light: {
      background: '#FAFAF9', foreground: '#292524', cursor: '#292524', selectionBackground: 'rgba(41, 37, 36, 0.1)',
      black: '#292524', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#A8A29E',
    },
    dark: {
      background: '#1C1917', foreground: '#F5F5F4', cursor: '#F5F5F4', selectionBackground: 'rgba(245, 245, 244, 0.2)',
      black: '#1C1917', red: '#F87171', green: '#34D399', yellow: '#FBBF24', blue: '#78716C', magenta: '#D946EF', cyan: '#A8A29E', white: '#F5F5F4',
    }
  },
  sepia: {
    light: {
      background: '#FEF3C7', foreground: '#78350F', cursor: '#78350F', selectionBackground: 'rgba(120, 53, 15, 0.1)',
      black: '#78350F', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#FDE68A',
    },
    dark: {
      background: '#451A03', foreground: '#FEF3C7', cursor: '#FEF3C7', selectionBackground: 'rgba(254, 243, 199, 0.2)',
      black: '#451A03', red: '#F87171', green: '#34D399', yellow: '#FBBF24', blue: '#F59E0B', magenta: '#FB923C', cyan: '#FCD34D', white: '#FEF3C7',
    }
  },
  nord: {
    light: {
      background: '#ECEFF4', foreground: '#2E3440', cursor: '#2E3440', selectionBackground: 'rgba(46, 52, 64, 0.12)',
      black: '#2E3440', red: '#BF616A', green: '#A3BE8C', yellow: '#EBCB8B', blue: '#5E81AC', magenta: '#B48EAD', cyan: '#88C0D0', white: '#4C566A',
    },
    dark: {
      background: '#2E3440', foreground: '#ECEFF4', cursor: '#ECEFF4', selectionBackground: 'rgba(236, 239, 244, 0.18)',
      black: '#2E3440', red: '#BF616A', green: '#A3BE8C', yellow: '#EBCB8B', blue: '#81A1C1', magenta: '#B48EAD', cyan: '#8FBCBB', white: '#ECEFF4',
    },
  },
  dracula: {
    light: {
      background: '#F8F8F2', foreground: '#282A36', cursor: '#282A36', selectionBackground: 'rgba(40, 42, 54, 0.12)',
      black: '#282A36', red: '#FF5555', green: '#50FA7B', yellow: '#F1FA8C', blue: '#6272A4', magenta: '#BD93F9', cyan: '#8BE9FD', white: '#44475A',
    },
    dark: {
      background: '#282A36', foreground: '#F8F8F2', cursor: '#F8F8F2', selectionBackground: 'rgba(248, 248, 242, 0.18)',
      black: '#282A36', red: '#FF5555', green: '#50FA7B', yellow: '#F1FA8C', blue: '#BD93F9', magenta: '#FF79C6', cyan: '#8BE9FD', white: '#F8F8F2',
    },
  },
  gruvbox: {
    light: {
      background: '#FBF1C7', foreground: '#3C3836', cursor: '#3C3836', selectionBackground: 'rgba(60, 56, 54, 0.12)',
      black: '#3C3836', red: '#CC241D', green: '#98971A', yellow: '#D79921', blue: '#458588', magenta: '#B16286', cyan: '#689D6A', white: '#7C6F64',
    },
    dark: {
      background: '#282828', foreground: '#EBDBB2', cursor: '#EBDBB2', selectionBackground: 'rgba(235, 219, 178, 0.16)',
      black: '#282828', red: '#FB4934', green: '#B8BB26', yellow: '#FABD2F', blue: '#83A598', magenta: '#D3869B', cyan: '#8EC07C', white: '#EBDBB2',
    },
  },
  tokyo: {
    light: {
      background: '#E6E7ED', foreground: '#3760BF', cursor: '#3760BF', selectionBackground: 'rgba(55, 96, 191, 0.15)',
      black: '#1F2335', red: '#F52A65', green: '#587539', yellow: '#8C6C3E', blue: '#3760BF', magenta: '#9854F1', cyan: '#007197', white: '#6172B0',
    },
    dark: {
      background: '#1A1B26', foreground: '#C0CAF5', cursor: '#C0CAF5', selectionBackground: 'rgba(192, 202, 245, 0.16)',
      black: '#1A1B26', red: '#F7768E', green: '#9ECE6A', yellow: '#E0AF68', blue: '#7AA2F7', magenta: '#BB9AF7', cyan: '#7DCFFF', white: '#C0CAF5',
    },
  },
  solarized: {
    light: {
      background: '#FDF6E3', foreground: '#586E75', cursor: '#586E75', selectionBackground: 'rgba(88, 110, 117, 0.15)',
      black: '#073642', red: '#DC322F', green: '#859900', yellow: '#B58900', blue: '#268BD2', magenta: '#D33682', cyan: '#2AA198', white: '#657B83',
    },
    dark: {
      background: '#002B36', foreground: '#839496', cursor: '#839496', selectionBackground: 'rgba(131, 148, 150, 0.16)',
      black: '#002B36', red: '#DC322F', green: '#859900', yellow: '#B58900', blue: '#268BD2', magenta: '#D33682', cyan: '#2AA198', white: '#93A1A1',
    },
  },
  monokai: {
    light: {
      background: '#F8F8F2', foreground: '#272822', cursor: '#272822', selectionBackground: 'rgba(39, 40, 34, 0.12)',
      black: '#272822', red: '#F92672', green: '#A6E22E', yellow: '#E6DB74', blue: '#66D9EF', magenta: '#AE81FF', cyan: '#A1EFE4', white: '#75715E',
    },
    dark: {
      background: '#272822', foreground: '#F8F8F2', cursor: '#F8F8F2', selectionBackground: 'rgba(248, 248, 242, 0.16)',
      black: '#272822', red: '#F92672', green: '#A6E22E', yellow: '#E6DB74', blue: '#66D9EF', magenta: '#AE81FF', cyan: '#A1EFE4', white: '#F8F8F2',
    },
  },
  catppuccin: {
    light: {
      background: '#EFF1F5', foreground: '#4C4F69', cursor: '#4C4F69', selectionBackground: 'rgba(76, 79, 105, 0.12)',
      black: '#4C4F69', red: '#D20F39', green: '#40A02B', yellow: '#DF8E1D', blue: '#1E66F5', magenta: '#8839EF', cyan: '#179299', white: '#6C6F85',
    },
    dark: {
      background: '#1E1E2E', foreground: '#CDD6F4', cursor: '#CDD6F4', selectionBackground: 'rgba(205, 214, 244, 0.16)',
      black: '#1E1E2E', red: '#F38BA8', green: '#A6E3A1', yellow: '#F9E2AF', blue: '#89B4FA', magenta: '#CBA6F7', cyan: '#94E2D5', white: '#CDD6F4',
    },
  },
  everforest: {
    light: {
      background: '#F3EAD3', foreground: '#5C6A72', cursor: '#5C6A72', selectionBackground: 'rgba(92, 106, 114, 0.12)',
      black: '#5C6A72', red: '#F85552', green: '#8DA101', yellow: '#DFA000', blue: '#3A94C5', magenta: '#DF69BA', cyan: '#35A77C', white: '#9DA9A0',
    },
    dark: {
      background: '#2B3339', foreground: '#D3C6AA', cursor: '#D3C6AA', selectionBackground: 'rgba(211, 198, 170, 0.16)',
      black: '#2B3339', red: '#E67E80', green: '#A7C080', yellow: '#DBBC7F', blue: '#7FBBB3', magenta: '#D699B6', cyan: '#83C092', white: '#D3C6AA',
    },
  },
  matrix: {
    light: {
      background: '#EAFBEA', foreground: '#064E3B', cursor: '#064E3B', selectionBackground: 'rgba(6, 78, 59, 0.14)',
      black: '#064E3B', red: '#B91C1C', green: '#16A34A', yellow: '#CA8A04', blue: '#047857', magenta: '#065F46', cyan: '#0F766E', white: '#14532D',
    },
    dark: {
      background: '#0C0F0A', foreground: '#00FF41', cursor: '#00FF41', selectionBackground: 'rgba(0, 255, 65, 0.18)',
      black: '#0C0F0A', red: '#FF0040', green: '#00FF41', yellow: '#C3FF00', blue: '#00D7A7', magenta: '#00FFB7', cyan: '#00FFC8', white: '#B6FFBF',
    },
  },
  paper: {
    light: {
      background: '#FAFAFA', foreground: '#111827', cursor: '#111827', selectionBackground: 'rgba(17, 24, 39, 0.1)',
      black: '#111827', red: '#DC2626', green: '#16A34A', yellow: '#CA8A04', blue: '#2563EB', magenta: '#9333EA', cyan: '#0891B2', white: '#6B7280',
    },
    dark: {
      background: '#111827', foreground: '#F9FAFB', cursor: '#F9FAFB', selectionBackground: 'rgba(249, 250, 251, 0.18)',
      black: '#111827', red: '#F87171', green: '#34D399', yellow: '#FBBF24', blue: '#60A5FA', magenta: '#C4B5FD', cyan: '#67E8F9', white: '#F9FAFB',
    },
  }
};

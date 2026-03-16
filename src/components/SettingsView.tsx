import React from 'react';
import { cn } from '../utils/cn';
import { THEME_FAMILIES, THEME_LABELS } from '../state/themes';

const TERMINAL_FONT_SUGGESTIONS = [
  'JetBrains Mono',
  'Cascadia Mono',
  'Cascadia Code',
  'Fira Code',
  'Iosevka',
  'Source Code Pro',
  'SF Mono',
  'Menlo',
  'Monaco',
  'Consolas',
  "'Courier New'",
  'ui-monospace',
  'monospace',
];

interface Profile {
  id: string;
  name: string;
  shell: string;
  args: string[];
  cwd: string;
  editable: boolean;
}

interface SettingsViewProps {
  profiles: Profile[];
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  theme: string;
  setTheme: (theme: any) => void;
  themeVariant: 'light' | 'dark';
  setThemeVariant: (variant: 'light' | 'dark') => void;
  terminalFontFamily: string;
  setTerminalFontFamily: (font: string) => void;
  terminalFontLigatures: boolean;
  setTerminalFontLigatures: (ligatures: boolean) => void;
  exportWorkspace: () => void;
  showOnboarding: () => void;
  resetState: () => void;
}

/**
 * Settings view for configuring profiles, appearance, and workspace management.
 */
const SettingsView: React.FC<SettingsViewProps> = ({
  profiles,
  updateProfile,
  theme,
  setTheme,
  themeVariant,
  setThemeVariant,
  terminalFontFamily,
  setTerminalFontFamily,
  terminalFontLigatures,
  setTerminalFontLigatures,
  exportWorkspace,
  showOnboarding,
  resetState,
}) => {
  return (
    <div className="absolute inset-0 p-8 overflow-y-auto bg-[var(--start)] z-20">
      <h2 className="text-xl font-bold mb-6 text-[var(--charcoal)] lowercase text-opacity-100">settings</h2>
      <div className="max-w-2xl space-y-8 pb-12">
        {/* Profile Configuration Section */}
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
                    className="bg-transparent border border-[var(--cornflower)] px-2 py-1 rounded-sm focus:outline-none focus:border-[var(--charcoal)]"
                    placeholder="shell"
                    value={profile.shell}
                    onChange={(e) => updateProfile(profile.id, { shell: e.target.value })}
                  />
                  <input
                    disabled={!profile.editable}
                    className="bg-transparent border border-[var(--cornflower)] px-2 py-1 rounded-sm focus:outline-none focus:border-[var(--charcoal)]"
                    placeholder="args"
                    value={profile.args.join(' ')}
                    onChange={(e) => updateProfile(profile.id, { args: e.target.value.split(' ').filter(Boolean) })}
                  />
                  <input
                    disabled={!profile.editable}
                    className="bg-transparent border border-[var(--cornflower)] px-2 py-1 rounded-sm focus:outline-none focus:border-[var(--charcoal)]"
                    placeholder="cwd"
                    value={profile.cwd}
                    onChange={(e) => updateProfile(profile.id, { cwd: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Theme/Appearance Section */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">appearance</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs mb-2 opacity-60 lowercase italic">theme family</p>
              <div className="grid grid-cols-4 gap-2">
                {THEME_FAMILIES.map((name) => (
                  <button
                    key={name}
                    onClick={() => setTheme(name)}
                    className={cn(
                      'px-3 py-2 rounded-sm text-[10px] uppercase tracking-wider border border-[var(--cornflower)] transition-colors',
                      theme === name ? 'bg-[var(--cornflower)]/40 text-[var(--charcoal)] border-[var(--charcoal)]/30' : 'hover:bg-[var(--cornflower)]/20'
                    )}
                  >
                    {THEME_LABELS[name as keyof typeof THEME_LABELS]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs mb-2 opacity-60 lowercase italic">mode</p>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setThemeVariant(variant)}
                    className={cn(
                      'px-4 py-2 rounded-sm text-xs uppercase tracking-wider border border-[var(--cornflower)] transition-colors',
                      themeVariant === variant ? 'bg-[var(--cornflower)]/40 text-[var(--charcoal)] border-[var(--charcoal)]/30' : 'hover:bg-[var(--cornflower)]/20'
                    )}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Customization Section */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">terminal</h3>
          
          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="text-xs mb-1 block opacity-60 lowercase italic">font family</label>
              <input
                className="w-full bg-transparent border border-[var(--cornflower)] px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-[var(--charcoal)]"
                placeholder="e.g. JetBrains Mono, Cascadia Mono, Consolas, 'Courier New', monospace"
                value={terminalFontFamily}
                list="terminal-font-suggestions"
                onChange={(e) => setTerminalFontFamily(e.target.value)}
              />
              <datalist id="terminal-font-suggestions">
                {TERMINAL_FONT_SUGGESTIONS.map((font) => (
                  <option key={font} value={font} />
                ))}
              </datalist>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTerminalFontLigatures(!terminalFontLigatures)}
                className={cn(
                  'w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none',
                  terminalFontLigatures ? 'bg-[var(--go)]' : 'bg-[var(--cornflower)]'
                )}
              >
                <div className={cn(
                  'absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200',
                  terminalFontLigatures ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
              <span className="text-sm lowercase">enable font ligatures</span>
            </div>
          </div>
        </section>

        {/* Workspace Management Section */}
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
              onClick={() => {}} // This is handled via a hidden input in App.tsx
              className="px-4 py-2 bg-[var(--cornflower)]/20 hover:bg-[var(--cornflower)]/40 rounded-sm text-sm lowercase transition-colors opacity-50 cursor-not-allowed"
              title="use the import button in the sidebar or command palette"
            >
              import (via palette)
            </button>
          </div>
        </section>

        {/* App Help / Maintenance Section */}
        <section>
          <h3 className="text-sm font-semibold mb-4 text-[var(--charcoal)] opacity-50 uppercase tracking-wider">help</h3>
          <div className="flex gap-2">
            <button
              onClick={showOnboarding}
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
  );
};

export default SettingsView;

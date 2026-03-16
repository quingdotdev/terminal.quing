import React from 'react';
import { cn } from '../utils/cn';
import { THEME_ORDER, THEME_LABELS } from '../state/themes';

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
  exportWorkspace: () => void;
  importWorkspace: () => void;
  showOnboarding: () => void;
  resetState: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  profiles,
  updateProfile,
  theme,
  setTheme,
  exportWorkspace,
  importWorkspace,
  showOnboarding,
  resetState,
}) => {
  return (
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
                {THEME_LABELS[name as keyof typeof THEME_LABELS]}
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
              onClick={importWorkspace}
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

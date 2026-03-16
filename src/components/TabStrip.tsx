import React from 'react';
import { Plus, ChevronDown, Moon, Sun, Minimize2, Maximize2, X, GripVertical, Terminal as TerminalIcon, Columns, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

interface TerminalTab {
  id: string;
  title: string;
  color?: string;
  panes: any[];
}

interface TabStripProps {
  tabs: TerminalTab[];
  activeTabId: string;
  currentView: 'terminal' | 'settings';
  compactTabs: boolean;
  onTabClick: (id: string) => void;
  onRemoveTab: (id: string, e: React.MouseEvent) => void;
  onAddTab: (profileId?: string) => void;
  onReorderTabs: (fromId: string, toId: string) => void;
  onStartRenaming: (id: string, title: string) => void;
  onContextMenu: (e: React.MouseEvent, type: 'tab', id: string) => void;
  draggingTabId: string | null;
  setDraggingTabId: (id: string | null) => void;
  editingId: string | null;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onRenameTab: (id: string) => void;
  tabActivity: Record<string, boolean>;
  showShellMenu: boolean;
  setShowShellMenu: (show: boolean) => void;
  profiles: any[];
  theme: string;
  onToggleTheme: () => void;
  onSetCurrentView: (view: 'terminal' | 'settings') => void;
  onShowPalette: (show: boolean) => void;
  tabStripRef: React.RefObject<HTMLDivElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  renderTabLabel: (tab: TerminalTab) => React.ReactNode;
  getSplitTitleParts: (tab: TerminalTab) => { title: string; color?: string }[];
}

/**
 * TabStrip component containing the horizontal list of tabs,
 * window controls, and the theme toggle.
 * 
 * Supports drag-and-drop reordering, renaming, and custom tab colors.
 */
const TabStrip: React.FC<TabStripProps> = ({
  tabs,
  activeTabId,
  currentView,
  compactTabs,
  onTabClick,
  onRemoveTab,
  onAddTab,
  onReorderTabs,
  onStartRenaming,
  onContextMenu,
  draggingTabId,
  setDraggingTabId,
  editingId,
  editValue,
  onEditValueChange,
  onRenameTab,
  tabActivity,
  showShellMenu,
  setShowShellMenu,
  profiles,
  theme,
  onToggleTheme,
  onSetCurrentView,
  onShowPalette,
  tabStripRef,
  menuRef,
  renderTabLabel,
  getSplitTitleParts,
}) => {
  return (
    <div className="h-10 border-b border-[var(--cornflower)] flex items-center bg-[var(--start)] relative select-none z-30">
      <div ref={tabStripRef} className="flex-1 flex overflow-x-auto no-scrollbar app-region-drag h-full items-center min-w-0">
        {tabs.map((t, idx) => (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
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
              onReorderTabs(fromId, t.id);
              setDraggingTabId(null);
            }}
            onDragEnd={() => setDraggingTabId(null)}
            onDoubleClick={() => onStartRenaming(t.id, t.title)}
            onContextMenu={(e) => onContextMenu(e, 'tab', t.id)}
            onClick={() => onTabClick(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTabClick(t.id);
              }
            }}
            className={cn(
              'h-full px-4 flex items-center gap-2 text-xs border-r border-[var(--cornflower)] transition-colors relative flex-shrink-0 app-region-no-drag cursor-pointer group focus:outline-none focus:bg-[var(--cornflower)]/40',
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
                onChange={(e) => onEditValueChange(e.target.value)}
                onBlur={() => onRenameTab(t.id)}
                onKeyDown={(e) => e.key === 'Enter' && onRenameTab(t.id)}
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
                onClick={(e) => onRemoveTab(t.id, e)}
              />
            </div>

            {/* Accent line for tab color */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 transition-colors duration-200"
              style={{
                backgroundColor: activeTabId === t.id
                  ? (t.panes.length > 1 ? 'transparent' : (t.color || 'var(--charcoal)'))
                  : 'transparent',
              }}
            />

            {/* Split tab accent gradient */}
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
        <button onClick={() => onAddTab()} className="px-3 h-10 hover:bg-[var(--cornflower)]/30 text-[var(--charcoal)] opacity-60 hover:opacity-100">
          <Plus size={14} />
        </button>
        <button onClick={() => setShowShellMenu(!showShellMenu)} className="px-2 h-10 hover:bg-[var(--cornflower)]/30 text-[var(--charcoal)] opacity-60 hover:opacity-100 border-l border-[var(--cornflower)]/30">
          <ChevronDown size={14} />
        </button>

        {/* New Tab Profile Menu */}
        {showShellMenu && (
          <div className="absolute top-10 right-0 w-64 bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl z-[100] py-1">
            {profiles.map((profile, idx) => (
              <button
                key={profile.id}
                onClick={() => { onAddTab(profile.id); setShowShellMenu(false); }}
                className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] text-[var(--charcoal)] opacity-70 hover:opacity-100 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <TerminalIcon size={12} />
                  <span className="lowercase">{profile.name}</span>
                </div>
                {idx < 3 && <span className="text-[10px] opacity-50 uppercase">Ctrl+Shift+{idx + 1}</span>}
              </button>
            ))}
            <div className="h-[1px] bg-[var(--cornflower)] my-1 mx-2" />
            <button onClick={() => { onSetCurrentView('settings'); setShowShellMenu(false); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] text-[var(--charcoal)] opacity-70 hover:opacity-100 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2">
                <Settings size={12} />
                <span className="lowercase">settings</span>
              </div>
              <span className="text-[10px] opacity-50 uppercase">Ctrl+,</span>
            </button>
            <button onClick={() => { onShowPalette(true); setShowShellMenu(false); }} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] text-[var(--charcoal)] opacity-70 hover:opacity-100 flex items-center justify-between transition-colors">
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
        <button onClick={onToggleTheme} className="px-3 h-10 hover:bg-[var(--cornflower)]/30 text-[var(--charcoal)] opacity-60 hover:opacity-100" title="toggle theme">
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <div className="px-4 flex gap-4 text-[var(--charcoal)] opacity-60">
          <button onClick={() => (window as any).terminalAPI.minimize()} className="hover:opacity-100 transition-opacity" title="minimize">
            <Minimize2 size={14} />
          </button>
          <button onClick={() => (window as any).terminalAPI.maximize()} className="hover:opacity-100 transition-opacity" title="maximize">
            <Maximize2 size={14} />
          </button>
          <button onClick={() => (window as any).terminalAPI.close()} className="hover:opacity-100 transition-opacity" title="close">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabStrip;

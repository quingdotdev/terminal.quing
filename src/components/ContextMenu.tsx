import React from 'react';
import { Palette, X, Type, Copy, Columns, ArrowLeft, ArrowRight, Download, Search, Clipboard, ClipboardPaste, List, Edit3, Trash2, ChevronDown, Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'project' | 'tab' | 'terminal';
  targetId: string;
  menuRef: React.RefObject<HTMLDivElement | null>;
  showColorSubmenu: boolean;
  setShowColorSubmenu: (show: boolean) => void;
  showSplitSubmenu: boolean;
  setShowSplitSubmenu: (show: boolean) => void;
  onSetTabColor: (color?: string) => void;
  onStartRenaming: (id: string, initialValue: string) => void;
  onDuplicateTab: () => void;
  onUnsplitTab: () => void;
  onSplitTab: (sourceTabId?: string) => void;
  onMoveTab: (direction: 'left' | 'right') => void;
  onExportWorkspace: () => void;
  onShowFind: () => void;
  onRemoveTab: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onRemoveProject: () => void;
  tabs: any[]; // TerminalTab[]
  projects: any[]; // Project[]
  presetColors: { name: string; value: string | undefined }[];
}

/**
 * Universal context menu component.
 * Displays different actions based on the `type` prop (project, tab, or terminal).
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  targetId,
  menuRef,
  showColorSubmenu,
  setShowColorSubmenu,
  showSplitSubmenu,
  setShowSplitSubmenu,
  onSetTabColor,
  onStartRenaming,
  onDuplicateTab,
  onUnsplitTab,
  onSplitTab,
  onMoveTab,
  onExportWorkspace,
  onShowFind,
  onRemoveTab,
  onCopy,
  onPaste,
  onSelectAll,
  onRemoveProject,
  tabs,
  projects,
  presetColors,
}) => {
  const currentTab = tabs.find((t) => t.id === targetId);
  const currentProject = projects.find((p) => p.id === targetId);

  return (
    <div
      ref={menuRef}
      className="fixed z-[2000] w-64 bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl rounded-sm py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: Math.min(y, window.innerHeight - 350),
        left: Math.min(x, window.innerWidth - 260),
      }}
    >
      {/* Tab Context Menu */}
      {type === 'tab' ? (
        <>
          <button
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
                {presetColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => onSetTabColor(c.value)}
                    className="w-5 h-5 rounded-full border border-[var(--cornflower)] flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value || 'transparent' }}
                    title={c.name}
                  >
                    {!c.value && <X size={10} />}
                  </button>
                ))}
              </div>
            )}
          </button>
          <button
            onClick={() => onStartRenaming(targetId, currentTab?.title || '')}
            className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3"
          >
            <Type size={14} /> Rename tab
          </button>
          <button onClick={onDuplicateTab} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <Copy size={14} /> Duplicate tab
          </button>

          {(currentTab?.panes?.length ?? 0) > 1 && (
            <button onClick={onUnsplitTab} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
              <Columns size={14} /> Unsplit into tabs
            </button>
          )}

          <button
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
                {tabs
                  .filter((t) => t.id !== targetId)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSplitTab(t.id)}
                      className="text-left py-1 opacity-60 hover:opacity-100 truncate flex items-center gap-2"
                    >
                      <TerminalIcon size={10} /> {t.title}
                    </button>
                  ))}
                <button
                  onClick={() => onSplitTab()}
                  className="text-left py-1 text-[var(--charcoal)] font-semibold mt-1 border-t border-[var(--cornflower)]/10 pt-1"
                >
                  + create new pane
                </button>
              </div>
            )}
          </button>

          <div className="flex border-b border-[var(--cornflower)]/30">
            <button onClick={() => onMoveTab('left')} className="flex-1 px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
              <ArrowLeft size={14} /> Move Left
            </button>
            <button onClick={() => onMoveTab('right')} className="flex-1 px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 border-l border-[var(--cornflower)]/30">
              <ArrowRight size={14} /> Move Right
            </button>
          </div>
          <button onClick={onExportWorkspace} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <Download size={14} /> Export workspace
          </button>
          <button onClick={onShowFind} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 border-b border-[var(--cornflower)]/30 pb-2">
            <Search size={14} /> Find
          </button>
          <button onClick={onRemoveTab} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 text-red-500 font-semibold">
            <X size={14} /> Close tab
          </button>
        </>
      ) : type === 'terminal' ? (
        /* Terminal Context Menu */
        <>
          <button onClick={onCopy} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <Clipboard size={14} /> Copy
          </button>
          <button onClick={onPaste} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <ClipboardPaste size={14} /> Paste
          </button>
          <button onClick={onSelectAll} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <List size={14} /> Select all
          </button>
          <button onClick={onShowFind} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <Search size={14} /> Find
          </button>
        </>
      ) : (
        /* Project Context Menu */
        <>
          <button onClick={() => onStartRenaming(targetId, currentProject?.name || '')} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3">
            <Edit3 size={14} /> Rename project
          </button>
          <button onClick={onRemoveProject} className="w-full px-4 py-2 text-xs text-left hover:bg-[var(--cornflower)] flex items-center gap-3 text-red-500">
            <Trash2 size={14} /> Delete project
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;

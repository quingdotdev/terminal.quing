import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn';

interface PaletteAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  search: string;
  onSearchChange: (value: string) => void;
  actions: PaletteAction[];
  activeIndex: number;
  onActionIndexChange: (index: number | ((prev: number) => number)) => void;
  onRunAction: (index: number) => void;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  inputRef,
  search,
  onSearchChange,
  actions,
  activeIndex,
  onActionIndexChange,
  onRunAction,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-xl bg-[var(--start)] border border-[var(--cornflower)] shadow-2xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="p-4 border-b border-[var(--cornflower)] flex items-center gap-3">
          <Search size={18} className="text-[var(--charcoal)] opacity-70" />
          <input
            ref={inputRef}
            autoFocus
            placeholder="search commands..."
            className="w-full bg-transparent border-none outline-none text-base placeholder:text-[var(--charcoal)]/40 text-[var(--charcoal)]"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onActionIndexChange(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                onActionIndexChange((prev) => (prev + 1) % actions.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onActionIndexChange((prev) => (prev - 1 + actions.length) % actions.length);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                onRunAction(activeIndex);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto p-1">
          {actions.length > 0 ? (
            actions.map((action, idx) => (
              <button
                key={action.label}
                onClick={() => action.action()}
                onMouseEnter={() => onActionIndexChange(idx)}
                className={cn(
                  'w-full px-4 py-3 flex items-center justify-between gap-3 text-sm transition-colors rounded-sm',
                  activeIndex === idx ? 'bg-[var(--cornflower)] text-[var(--charcoal)]' : 'text-[var(--charcoal)] opacity-60 hover:opacity-100 hover:bg-[var(--cornflower)]/30'
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
  );
};

export default CommandPalette;

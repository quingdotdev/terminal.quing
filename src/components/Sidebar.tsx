import React from 'react';
import { Plus, Folder } from 'lucide-react';
import { cn } from '../utils/cn';

interface Project {
  id: string;
  name: string;
  tabs: any[];
}

interface SidebarProps {
  collapsed: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  projects: Project[];
  activeProjectId: string;
  onProjectClick: (projectId: string) => void;
  onAddProject: () => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onStartRenaming: (id: string, name: string) => void;
  editingId: string | null;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onRenameProject: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  hovered,
  onHoverChange,
  projects,
  activeProjectId,
  onProjectClick,
  onAddProject,
  onContextMenu,
  onStartRenaming,
  editingId,
  editValue,
  onEditValueChange,
  onRenameProject,
}) => {
  return (
    <aside
      className={cn('relative transition-all duration-300 ease-in-out z-40', collapsed ? 'w-14' : 'w-64')}
      onMouseEnter={() => collapsed && onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div
        className={cn(
          'flex flex-col h-full bg-[var(--start)] border-r border-[var(--cornflower)] transition-all duration-300 ease-in-out overflow-hidden',
          collapsed && hovered ? 'absolute w-64 shadow-2xl' : 'w-full'
        )}
      >
        <div className={cn('p-3 border-b border-[var(--cornflower)] flex items-center', collapsed && !hovered ? 'justify-center' : 'justify-between')}>
          {(!collapsed || hovered) && (
            <h1 className="text-sm font-semibold tracking-tight lowercase animate-in fade-in duration-300">projects</h1>
          )}
          <button onClick={onAddProject} className="p-1 hover:bg-[var(--cornflower)] rounded-sm transition-colors text-[var(--charcoal)] opacity-60 hover:opacity-100">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map((p, idx) => (
            <div
              key={p.id}
              onDoubleClick={() => (!collapsed || hovered) && onStartRenaming(p.id, p.name)}
              onContextMenu={(e) => onContextMenu(e, p.id)}
              onClick={() => onProjectClick(p.id)}
              className={cn(
                'w-full flex items-center justify-between gap-2 py-2 text-sm rounded-sm transition-colors text-left cursor-pointer group',
                collapsed && !hovered ? 'justify-center px-0' : 'justify-between px-3',
                activeProjectId === p.id ? 'bg-[var(--cornflower)] text-[var(--charcoal)]' : 'hover:bg-[var(--cornflower)]/50'
              )}
              title={collapsed && !hovered ? p.name : undefined}
            >
              <div className={cn('flex items-center gap-2 truncate', collapsed && !hovered && 'justify-center')}>
                <Folder size={14} className={activeProjectId === p.id ? 'text-[var(--charcoal)]' : 'text-[var(--charcoal)] opacity-40'} />
                {(!collapsed || hovered) && (
                  editingId === p.id ? (
                    <input
                      autoFocus
                      className="bg-transparent border-none outline-none text-[var(--charcoal)] w-full lowercase"
                      value={editValue}
                      onChange={(e) => onEditValueChange(e.target.value)}
                      onBlur={() => onRenameProject(p.id)}
                      onKeyDown={(e) => e.key === 'Enter' && onRenameProject(p.id)}
                    />
                  ) : (
                    <span className="lowercase truncate animate-in fade-in duration-300">{p.name}</span>
                  )
                )}
              </div>
              {(!collapsed || hovered) && (
                <span className="text-[10px] opacity-30 group-hover:opacity-100 transition-opacity animate-in fade-in duration-300">Alt+{idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

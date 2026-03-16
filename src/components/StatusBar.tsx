import React from 'react';

interface StatusBarProps {
  projectName?: string;
  tabTitle?: string;
  profileName?: string;
  cwd?: string;
  cols?: number;
  rows?: number;
  isConnected?: boolean;
}

/**
 * Status bar component displayed at the bottom of the window.
 * Shows metadata about the currently active terminal session.
 */
const StatusBar: React.FC<StatusBarProps> = ({
  projectName,
  tabTitle,
  profileName,
  cwd,
  cols,
  rows,
  isConnected,
}) => {
  return (
    <div className="status-bar border-t border-[var(--cornflower)] bg-[var(--start)] px-3 flex items-center gap-4 text-[var(--charcoal)] opacity-70">
      <span className="uppercase tracking-widest text-[10px] opacity-50">status</span>
      <span>{projectName || 'project'}</span>
      <span className="opacity-30">|</span>
      <span>{tabTitle || 'tab'}</span>
      <span className="opacity-30">|</span>
      <span>{profileName || 'profile'}</span>
      <span className="opacity-30">|</span>
      <span>{cwd || '~'}</span>
      <span className="opacity-30">|</span>
      <span>{cols && rows ? `${cols}x${rows}` : 'size'}</span>
      <span className="opacity-30">|</span>
      <span className={isConnected ? 'text-[var(--go)]' : 'text-[var(--alert)]'}>
        {isConnected ? 'connected' : 'disconnected'}
      </span>
    </div>
  );
};

export default StatusBar;

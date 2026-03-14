import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';

interface TerminalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const TerminalSearchBar: React.FC<TerminalSearchBarProps> = ({
  value,
  onChange,
  onNext,
  onPrev,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="absolute right-4 top-4 z-50 w-80 border border-[var(--cornflower)] bg-[var(--start)] shadow-xl rounded-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <Search size={14} className="opacity-50" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onNext();
            if (e.key === 'Escape') onClose();
          }}
          placeholder="find in terminal..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--charcoal)]"
        />
        <button onClick={onPrev} className="p-1 opacity-60 hover:opacity-100">
          <ArrowUp size={14} />
        </button>
        <button onClick={onNext} className="p-1 opacity-60 hover:opacity-100">
          <ArrowDown size={14} />
        </button>
        <button onClick={onClose} className="p-1 opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TerminalSearchBar;

import React from 'react';
import { HelpCircle, LogOut } from 'lucide-react';
import { ConnectionIndicator } from '@/components/shared/ConnectionIndicator';

interface Props {
  version: string;
  userEmail: string | null;
  onHelp: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ version, userEmail, onHelp, onLogout }) => {
  return (
    <header className="flex h-9 shrink-0 items-center justify-between border-b border-tan/20 bg-charcoal px-3">
      <div className="flex items-center gap-3">
        <span className="font-display text-[13px] tracking-tight text-neutral-100">General Exchange</span>
        <span className="text-[10px] text-zinc-600">Terminal v{version}</span>
      </div>
      <div className="flex items-center gap-4">
        <ConnectionIndicator />
        {userEmail && <span className="text-[11px] text-zinc-500">{userEmail}</span>}
        <button onClick={onHelp} title="Restart tour" className="text-zinc-500 hover:text-tan" data-tour="help">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button onClick={onLogout} title="Log out" className="text-zinc-500 hover:text-red-400">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

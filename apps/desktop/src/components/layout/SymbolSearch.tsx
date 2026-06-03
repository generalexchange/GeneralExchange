import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSubmit: (symbol: string) => void;
}

export const SymbolSearch: React.FC<Props> = ({ onSubmit }) => {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = value.trim().toUpperCase();
    if (sym) {
      onSubmit(sym);
      setValue('');
    }
  };

  return (
    <form onSubmit={submit} className="relative px-2 py-2" data-tour="symbol-search">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search symbol…"
        spellCheck={false}
        className="tabular h-8 w-full rounded border border-white/10 bg-black/30 pl-8 pr-2 text-[13px] uppercase text-neutral-100 outline-none placeholder:normal-case placeholder:text-zinc-600 focus:border-brass/50"
      />
    </form>
  );
};

import React, { useId, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface DashboardTooltipProps {
  label: string;
  description: string;
  className?: string;
}

/** Accessible hover/focus hint for dashboard metrics (keyboard + screen readers). */
export const DashboardTooltip: React.FC<DashboardTooltipProps> = ({ label, description, className = '' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <span>{label}</span>
      <button
        type="button"
        className="shrink-0 rounded p-0.5 text-zinc-500 hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        aria-describedby={open ? id : undefined}
        aria-label={`Help: ${label}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-50 mt-1 max-w-[240px] rounded-lg border border-white/15 bg-[#12141a]/98 px-2.5 py-2 text-[11px] leading-snug text-zinc-300 shadow-xl"
        >
          {description}
        </span>
      )}
    </span>
  );
};

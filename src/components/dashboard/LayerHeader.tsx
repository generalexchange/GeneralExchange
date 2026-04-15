'use client';

import React from 'react';

export function LayerHeader({
  step,
  title,
  subtitle,
  headingId,
  stepButtonProps,
}: {
  step: string;
  title: string;
  subtitle: string;
  headingId?: string;
  stepButtonProps?: { onClick: () => void; 'aria-label': string };
}) {
  const stepClassName =
    'font-mono text-xs text-zinc-400 tabular-nums border border-white/10 rounded-lg px-2 py-1 bg-white/[0.03]';

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        {stepButtonProps ? (
          <button
            type="button"
            onClick={stepButtonProps.onClick}
            aria-label={stepButtonProps['aria-label']}
            className={`${stepClassName} cursor-pointer transition-all hover:border-white/20 hover:bg-white/[0.06] hover:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal`}
          >
            {step}
          </button>
        ) : (
          <span className={stepClassName}>{step}</span>
        )}
        <div>
          <h2 id={headingId} className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

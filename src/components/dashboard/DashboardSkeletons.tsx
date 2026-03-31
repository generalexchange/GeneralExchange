import React from 'react';

const pulse = 'animate-pulse rounded-xl bg-white/[0.06] border border-white/[0.06]';

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = 'h-[280px]' }) => (
  <div className={`${pulse} ${className} w-full`} aria-hidden />
);

export const OrderBookSkeleton: React.FC = () => (
  <div className={`${pulse} min-h-[280px] w-full`} aria-hidden>
    <div className="p-4 space-y-3">
      <div className="h-3 w-24 bg-white/[0.08] rounded" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-white/[0.05] rounded-md" />
        ))}
      </div>
    </div>
  </div>
);

export const MetricCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={`${pulse} h-[120px]`} aria-hidden />
    ))}
  </div>
);

export const PanelSkeleton: React.FC<{ tall?: boolean }> = ({ tall }) => (
  <div className={`${pulse} w-full ${tall ? 'min-h-[200px]' : 'h-32'}`} aria-hidden />
);

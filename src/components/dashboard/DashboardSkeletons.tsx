import React from 'react';

const pulse = 'animate-pulse rounded-xl bg-white/[0.06] border border-white/[0.06]';

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = 'h-[280px]' }) => (
  <div className={`${pulse} ${className} w-full`} aria-hidden />
);

export const OrderBookSkeleton: React.FC = () => (
  <div className={`${pulse} min-h-[480px] w-full`} aria-hidden>
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className={`${pulse} h-[120px] ${i === 0 ? 'sm:col-span-2 xl:col-span-1' : ''}`}
        aria-hidden
      />
    ))}
  </div>
);

export const OutlookPanelSkeleton: React.FC = () => (
  <div className={`${pulse} min-h-[280px] w-full sm:min-h-[320px]`} aria-hidden>
    <div className="p-4 space-y-4">
      <div className="h-3 w-32 bg-white/[0.08] rounded" />
      <div className="h-16 bg-white/[0.06] rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 bg-white/[0.05] rounded-md" />
      ))}
    </div>
  </div>
);

export const PanelSkeleton: React.FC<{ tall?: boolean }> = ({ tall }) => (
  <div className={`${pulse} w-full ${tall ? 'min-h-[200px]' : 'h-32'}`} aria-hidden />
);

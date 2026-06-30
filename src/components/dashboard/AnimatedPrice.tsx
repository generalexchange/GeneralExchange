'use client';

/**
 * Animated price display — uses @number-flow/react on web; static on desktop IBKR.
 */
import NumberFlow from '@number-flow/react';
import { isLocalDesktopClient } from '@/lib/api/v1Fetch';

type AnimatedPriceProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  /** Faster transitions for HFT tape (ms). Set 0 to disable animation. */
  durationMs?: number;
};

function fmt(value: number, decimals: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function AnimatedPrice({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  durationMs = 280,
}: AnimatedPriceProps) {
  if (!Number.isFinite(value) || value <= 0) {
    return <span className={className}>—</span>;
  }

  const staticDisplay = isLocalDesktopClient() || durationMs === 0;

  if (staticDisplay) {
    return (
      <span className={`inline-flex items-baseline tabular-nums ${className}`}>
        {prefix}
        {fmt(value, decimals)}
        {suffix}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-baseline tabular-nums ${className}`}>
      {prefix ? <span>{prefix}</span> : null}
      <NumberFlow
        value={value}
        locales="en-US"
        format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals }}
        transformTiming={{ duration: durationMs, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        spinTiming={{ duration: durationMs, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        opacityTiming={{ duration: Math.min(180, durationMs), easing: 'ease-out' }}
      />
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}

export function AnimatedSignedChange({
  value,
  isPct = false,
  className = '',
}: {
  value: number;
  isPct?: boolean;
  className?: string;
}) {
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  const abs = Math.abs(value);
  if (isLocalDesktopClient()) {
    if (isPct) {
      return (
        <span className={className}>
          {sign}
          {abs.toFixed(2)}%
        </span>
      );
    }
    return (
      <span className={className}>
        {sign}${fmt(abs, 2)}
      </span>
    );
  }
  if (isPct) {
    return (
      <span className={className}>
        {sign}
        <AnimatedPrice value={abs} decimals={2} durationMs={240} />
        %
      </span>
    );
  }
  return (
    <span className={className}>
      {sign}$
      <AnimatedPrice value={abs} decimals={2} durationMs={240} />
    </span>
  );
}

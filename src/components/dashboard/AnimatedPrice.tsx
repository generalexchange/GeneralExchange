'use client';

/**
 * Animated price display — uses @number-flow/react (MIT, github.com/barvian/number-flow).
 * Robinhood-style rolling digit transitions for live feeds.
 */
import NumberFlow from '@number-flow/react';

type AnimatedPriceProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  /** Faster transitions for HFT tape (ms). */
  durationMs?: number;
};

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

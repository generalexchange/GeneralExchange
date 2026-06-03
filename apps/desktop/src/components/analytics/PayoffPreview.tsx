import React, { useMemo } from 'react';
import { CHART } from '@/components/charts/chartTheme';
import { CONTRACT_MULTIPLIER } from '@/lib/constants';
import type { OptionRow } from '@/types/market';

interface Props {
  contract: OptionRow | null;
  spot: number | null;
  side: 'buy' | 'sell';
}

/**
 * Compact expiry payoff for a single long/short option. Inline SVG (not a chart
 * library) so it stays cheap in the dense right rail.
 */
export const PayoffPreview: React.FC<Props> = ({ contract, spot, side }) => {
  const path = useMemo(() => {
    if (!contract || spot == null) return null;
    const w = 240;
    const h = 64;
    const lo = spot * 0.85;
    const hi = spot * 1.15;
    const premium = contract.mid * CONTRACT_MULTIPLIER;
    const dirMul = side === 'buy' ? 1 : -1;

    const payoff = (px: number) => {
      const intrinsic = contract.type === 'call' ? Math.max(px - contract.strike, 0) : Math.max(contract.strike - px, 0);
      return dirMul * (intrinsic * CONTRACT_MULTIPLIER - premium);
    };

    const samples = 48;
    const ys: number[] = [];
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const px = lo + ((hi - lo) * i) / samples;
      const v = payoff(px);
      ys.push(v);
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const span = max - min || 1;
    const pts = ys
      .map((v, i) => `${(i / samples) * w},${h - ((v - min) / span) * (h - 4) - 2}`)
      .join(' ');
    const zeroY = h - ((0 - min) / span) * (h - 4) - 2;
    return { w, h, pts, zeroY };
  }, [contract, spot, side]);

  if (!path) return null;

  return (
    <svg width="100%" viewBox={`0 0 ${path.w} ${path.h}`} className="mt-1 block">
      <line x1={0} x2={path.w} y1={path.zeroY} y2={path.zeroY} stroke={CHART.axisLine} strokeWidth={1} strokeDasharray="2 3" />
      <polyline points={path.pts} fill="none" stroke={CHART.brass} strokeWidth={1.5} />
    </svg>
  );
};

/**
 * Options payoff diagram — Visx.
 *
 * Solid line = current mark-to-model value across the underlying range; dashed
 * line = value at expiration (intrinsic − premium). The x range is centered on
 * spot and spans ±2 implied-move σ. Green/red LinearGradient fills the area
 * above/below break-even; vertical reference lines mark break-evens and spot.
 *
 * Wrapped in ParentSize for responsive sizing; scales + sampled curves are
 * memoized so the expensive sampling only runs when the position changes.
 */

'use client';

import React, { useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath, AreaClosed, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { CHART } from '../charts/chartTokens';
import {
  type PositionSpec,
  payoffAtExpiry,
  payoffNow,
  impliedMove,
  breakevens,
} from './optionsMath';

const MARGIN = { top: 12, right: 16, bottom: 28, left: 52 };

interface Pt {
  s: number;
  exp: number;
  now: number;
}

function PayoffInner({ width, height, spec }: { width: number; height: number; spec: PositionSpec }) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const { pts, xScale, yScale, zeroY, bes } = useMemo(() => {
    const move = impliedMove(spec);
    const lo = Math.max(0.01, spec.spot - 2 * move);
    const hi = spec.spot + 2 * move;
    const n = 80;
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const s = lo + ((hi - lo) * i) / n;
      pts.push({ s, exp: payoffAtExpiry(spec, s), now: payoffNow(spec, s) });
    }
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      minY = Math.min(minY, p.exp, p.now);
      maxY = Math.max(maxY, p.exp, p.now);
    }
    const pad = (maxY - minY) * 0.08 || 1;
    const xScale = scaleLinear({ domain: [lo, hi], range: [0, innerW] });
    const yScale = scaleLinear({ domain: [minY - pad, maxY + pad], range: [innerH, 0] });
    return { pts, xScale, yScale, zeroY: yScale(0), bes: breakevens(spec) };
  }, [spec, innerW, innerH]);

  if (innerW <= 0 || innerH <= 0) return null;

  return (
    <svg width={width} height={height}>
      <LinearGradient id="payoff-pos" from={CHART.up} fromOpacity={0.28} to={CHART.up} toOpacity={0} />
      <LinearGradient id="payoff-neg" from={CHART.down} fromOpacity={0} to={CHART.down} toOpacity={0.28} />
      <Group left={MARGIN.left} top={MARGIN.top}>
        {/* zero baseline */}
        <Line from={{ x: 0, y: zeroY }} to={{ x: innerW, y: zeroY }} stroke={CHART.axisLine} strokeWidth={1} />

        {/* expiration payoff with green-above / red-below fills clipped at zero */}
        <AreaClosed<Pt>
          data={pts}
          x={(d) => xScale(d.s)}
          y={(d) => Math.min(yScale(d.exp), zeroY)}
          y0={() => zeroY}
          yScale={yScale}
          fill="url(#payoff-pos)"
          curve={curveMonotoneX}
        />
        <AreaClosed<Pt>
          data={pts}
          x={(d) => xScale(d.s)}
          y={() => zeroY}
          y0={(d) => Math.max(yScale(d.exp), zeroY)}
          yScale={yScale}
          fill="url(#payoff-neg)"
          curve={curveMonotoneX}
        />

        {/* break-even verticals */}
        {bes.map((be, i) =>
          be >= (xScale.domain()[0] as number) && be <= (xScale.domain()[1] as number) ? (
            <Line
              key={i}
              from={{ x: xScale(be), y: 0 }}
              to={{ x: xScale(be), y: innerH }}
              stroke={CHART.textDim}
              strokeWidth={1}
              strokeDasharray="2,3"
            />
          ) : null,
        )}

        {/* spot vertical */}
        <Line
          from={{ x: xScale(spec.spot), y: 0 }}
          to={{ x: xScale(spec.spot), y: innerH }}
          stroke={CHART.brass}
          strokeWidth={1}
          strokeDasharray="3,3"
        />

        <LinePath<Pt> data={pts} x={(d) => xScale(d.s)} y={(d) => yScale(d.exp)} stroke={CHART.tan} strokeWidth={1.25} strokeDasharray="4,3" curve={curveMonotoneX} />
        <LinePath<Pt> data={pts} x={(d) => xScale(d.s)} y={(d) => yScale(d.now)} stroke={CHART.brass} strokeWidth={1.75} curve={curveMonotoneX} />

        <AxisBottom
          top={innerH}
          scale={xScale}
          numTicks={5}
          stroke={CHART.axisLine}
          tickStroke={CHART.axisLine}
          tickLabelProps={() => ({ fill: CHART.textDim, fontSize: 9, textAnchor: 'middle', fontFamily: CHART.mono })}
        />
        <AxisLeft
          scale={yScale}
          numTicks={4}
          stroke={CHART.axisLine}
          tickStroke={CHART.axisLine}
          tickFormat={(v) => Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(v))}
          tickLabelProps={() => ({ fill: CHART.textDim, fontSize: 9, textAnchor: 'end', dx: -2, dy: 3, fontFamily: CHART.mono })}
        />
      </Group>
    </svg>
  );
}

const PayoffInnerMemo = React.memo(PayoffInner);

export function PayoffDiagram({ spec }: { spec: PositionSpec }) {
  return (
    <ParentSize>{({ width, height }) => <PayoffInnerMemo width={width} height={height} spec={spec} />}</ParentSize>
  );
}

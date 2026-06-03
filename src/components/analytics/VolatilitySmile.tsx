/**
 * Volatility smile — Visx scatter with a smooth curve fit.
 *
 * x = strike, y = implied vol. Each point is a strike in the selected
 * expiration; a natural-spline curve is fit through them. Strikes below spot use
 * the put color, above use the call color, and the ATM strike is highlighted in
 * brass.
 */

'use client';

import React, { useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath, Circle, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveNatural } from '@visx/curve';
import { CHART } from '../charts/chartTokens';

export interface SmilePoint {
  strike: number;
  iv: number; // percent
}

const MARGIN = { top: 12, right: 14, bottom: 26, left: 40 };

function SmileInner({ width, height, points, spot }: { width: number; height: number; points: SmilePoint[]; spot: number }) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const { data, xScale, yScale, atmStrike } = useMemo(() => {
    const data = [...points].sort((a, b) => a.strike - b.strike);
    const strikes = data.map((d) => d.strike);
    const ivs = data.map((d) => d.iv);
    const xScale = scaleLinear({ domain: [Math.min(...strikes), Math.max(...strikes)], range: [0, innerW] });
    const yMin = Math.min(...ivs);
    const yMax = Math.max(...ivs);
    const pad = (yMax - yMin) * 0.12 || 1;
    const yScale = scaleLinear({ domain: [yMin - pad, yMax + pad], range: [innerH, 0] });
    const atmStrike = data.reduce((best, d) => (Math.abs(d.strike - spot) < Math.abs(best - spot) ? d.strike : best), data[0]?.strike ?? spot);
    return { data, xScale, yScale, atmStrike };
  }, [points, spot, innerW, innerH]);

  if (innerW <= 0 || innerH <= 0 || data.length === 0) return null;

  return (
    <svg width={width} height={height}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        {/* spot marker */}
        <Line from={{ x: xScale(spot), y: 0 }} to={{ x: xScale(spot), y: innerH }} stroke={CHART.brass} strokeWidth={1} strokeDasharray="3,3" />
        <LinePath<SmilePoint> data={data} x={(d) => xScale(d.strike)} y={(d) => yScale(d.iv)} stroke={CHART.tan} strokeWidth={1.5} curve={curveNatural} />
        {data.map((d) => {
          const isAtm = d.strike === atmStrike;
          const color = isAtm ? CHART.brass : d.strike < spot ? CHART.down : CHART.up;
          return <Circle key={d.strike} cx={xScale(d.strike)} cy={yScale(d.iv)} r={isAtm ? 3.5 : 2.5} fill={color} stroke={isAtm ? CHART.charcoal : 'none'} strokeWidth={isAtm ? 1 : 0} />;
        })}
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
          tickFormat={(v) => `${Number(v).toFixed(0)}%`}
          tickLabelProps={() => ({ fill: CHART.textDim, fontSize: 9, textAnchor: 'end', dx: -2, dy: 3, fontFamily: CHART.mono })}
        />
      </Group>
    </svg>
  );
}

const SmileInnerMemo = React.memo(SmileInner);

export function VolatilitySmile({ points, spot }: { points: SmilePoint[]; spot: number }) {
  return <ParentSize>{({ width, height }) => <SmileInnerMemo width={width} height={height} points={points} spot={spot} />}</ParentSize>;
}

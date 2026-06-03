/**
 * Scenario grid (PnL surface / risk matrix) — Visx.
 *
 * x = underlying % change (−15…+15), y = IV change in vol points (+10…−10).
 * Each cell is colored by position PnL on the same diverging red→green scale as
 * the monthly heatmap. Hovering a cell reveals exact PnL plus estimated delta,
 * vega, and theta contributions — the two-dimensional risk read experienced
 * options traders size positions from.
 */

'use client';

import React, { useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleBand } from '@visx/scale';
import { Group } from '@visx/group';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { CHART, divergingColor } from '../charts/chartTokens';
import { type PositionSpec, scenarioMatrix, type ScenarioCell } from './optionsMath';

const MARGIN = { top: 8, right: 8, bottom: 26, left: 38 };
const money = (n: number) => `${n >= 0 ? '+' : ''}${Math.round(n).toLocaleString('en-US')}`;

function ScenarioInner({ width, height, spec }: { width: number; height: number; spec: PositionSpec }) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } = useTooltip<ScenarioCell>();

  const { cells, xScale, yScale, maxAbs, priceVals, volVals } = useMemo(() => {
    const cells = scenarioMatrix(spec);
    const priceVals = Array.from(new Set(cells.map((c) => c.dPricePct)));
    const volVals = Array.from(new Set(cells.map((c) => c.dVolPts)));
    const xScale = scaleBand({ domain: priceVals, range: [0, innerW], padding: 0.04 });
    const yScale = scaleBand({ domain: volVals, range: [0, innerH], padding: 0.04 });
    const maxAbs = Math.max(1, ...cells.map((c) => Math.abs(c.pnl)));
    return { cells, xScale, yScale, maxAbs, priceVals, volVals };
  }, [spec, innerW, innerH]);

  if (innerW <= 0 || innerH <= 0) return null;
  const bw = xScale.bandwidth();
  const bh = yScale.bandwidth();

  return (
    <>
      <svg width={width} height={height}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          {cells.map((c, i) => {
            const x = xScale(c.dPricePct) ?? 0;
            const y = yScale(c.dVolPts) ?? 0;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={bw}
                height={bh}
                rx={1}
                fill={divergingColor(c.pnl / maxAbs)}
                onMouseMove={(e) => {
                  const pt = localPoint(e) ?? { x, y };
                  showTooltip({ tooltipData: c, tooltipLeft: pt.x, tooltipTop: pt.y });
                }}
                onMouseLeave={hideTooltip}
              />
            );
          })}
          {/* x labels */}
          {priceVals.map((p) => (
            <text
              key={`x${p}`}
              x={(xScale(p) ?? 0) + bw / 2}
              y={innerH + 16}
              fontSize={9}
              fontFamily={CHART.mono}
              fill={CHART.textDim}
              textAnchor="middle"
            >
              {p > 0 ? `+${p}` : p}
            </text>
          ))}
          {/* y labels */}
          {volVals.map((v) => (
            <text
              key={`y${v}`}
              x={-6}
              y={(yScale(v) ?? 0) + bh / 2 + 3}
              fontSize={9}
              fontFamily={CHART.mono}
              fill={CHART.textDim}
              textAnchor="end"
            >
              {v > 0 ? `+${v}` : v}
            </text>
          ))}
          <text x={innerW / 2} y={innerH + 24} fontSize={9} fill={CHART.textDim} textAnchor="middle" fontFamily={CHART.mono}>
            underlying % change
          </text>
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            position: 'absolute',
            background: 'rgba(19,20,28,0.96)',
            border: `1px solid ${CHART.border}`,
            color: CHART.textBright,
            fontFamily: CHART.mono,
            fontSize: 10,
            padding: '6px 8px',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        >
          <div style={{ color: tooltipData.pnl >= 0 ? CHART.up : CHART.down, fontWeight: 600 }}>
            PnL {money(tooltipData.pnl)}
          </div>
          <div style={{ color: CHART.textDim }}>
            {tooltipData.dPricePct > 0 ? '+' : ''}
            {tooltipData.dPricePct}% spot · {tooltipData.dVolPts > 0 ? '+' : ''}
            {tooltipData.dVolPts} vol
          </div>
          <div>δ {money(tooltipData.deltaContribution)}</div>
          <div>ν {money(tooltipData.vegaContribution)}</div>
          <div>θ {money(tooltipData.thetaContribution)}</div>
        </TooltipWithBounds>
      )}
    </>
  );
}

const ScenarioInnerMemo = React.memo(ScenarioInner);

export function ScenarioGrid({ spec }: { spec: PositionSpec }) {
  return (
    <div className="relative h-full w-full">
      <ParentSize>{({ width, height }) => <ScenarioInnerMemo width={width} height={height} spec={spec} />}</ParentSize>
    </div>
  );
}

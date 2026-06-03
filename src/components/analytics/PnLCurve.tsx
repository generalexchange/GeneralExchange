/**
 * Backtest PnL curve with drawdown overlay — Visx.
 *
 * Two stacked charts share one time scale: cumulative equity (top) and drawdown
 * as a red filled area (bottom). A brush at the very bottom zooms both charts to
 * a sub-range of the backtest. Scales are memoized so brushing doesn't re-run
 * the equity sampling.
 */

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinePath, AreaClosed } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { Brush } from '@visx/brush';
import type { Bounds } from '@visx/brush/lib/types';
import { curveMonotoneX } from '@visx/curve';
import { CHART } from '../charts/chartTokens';
import type { EquityPoint } from '../backtest/backtestData';

const MARGIN = { top: 10, right: 16, bottom: 8, left: 56 };
const compact = (n: number) => Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

function PnLInner({ width, height, equity }: { width: number; height: number; equity: EquityPoint[] }) {
  const [domain, setDomain] = useState<[number, number] | null>(null);

  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const totalInnerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const equityH = totalInnerH * 0.52;
  const ddH = totalInnerH * 0.24;
  const brushH = Math.max(18, totalInnerH * 0.16);
  const gap = totalInnerH - equityH - ddH - brushH;

  const visible = useMemo(() => {
    if (!domain) return equity;
    return equity.filter((p) => p.t >= domain[0] && p.t <= domain[1]);
  }, [equity, domain]);

  const { xScale, xBrush, yEquity, yDd } = useMemo(() => {
    const data = visible.length > 1 ? visible : equity;
    const xScale = scaleTime({
      domain: [new Date(data[0].t), new Date(data[data.length - 1].t)],
      range: [0, innerW],
    });
    const xBrush = scaleTime({
      domain: [new Date(equity[0].t), new Date(equity[equity.length - 1].t)],
      range: [0, innerW],
    });
    const eqMin = Math.min(...data.map((p) => p.equity));
    const eqMax = Math.max(...data.map((p) => p.equity));
    const yEquity = scaleLinear({ domain: [eqMin * 0.99, eqMax * 1.01], range: [equityH, 0] });
    const ddMin = Math.min(...data.map((p) => p.drawdown), -1);
    const yDd = scaleLinear({ domain: [ddMin * 1.05, 0], range: [ddH, 0] });
    return { xScale, xBrush, yEquity, yDd };
  }, [visible, equity, innerW, equityH, ddH]);

  const onBrushChange = useCallback((b: Bounds | null) => {
    if (!b) {
      setDomain(null);
      return;
    }
    setDomain([+b.x0, +b.x1]);
  }, []);

  if (innerW <= 0 || totalInnerH <= 0) return null;
  const ddTop = MARGIN.top + equityH + gap * 0.5;
  const brushTop = ddTop + ddH + gap * 0.5;

  return (
    <svg width={width} height={height}>
      <LinearGradient id="dd-fill" from={CHART.down} fromOpacity={0.05} to={CHART.down} toOpacity={0.4} vertical />
      {/* equity */}
      <Group left={MARGIN.left} top={MARGIN.top}>
        <LinePath data={visible} x={(d) => xScale(new Date(d.t))} y={(d) => yEquity(d.equity)} stroke={CHART.brass} strokeWidth={1.5} curve={curveMonotoneX} />
        <AxisLeft
          scale={yEquity}
          numTicks={4}
          stroke={CHART.axisLine}
          tickStroke={CHART.axisLine}
          tickFormat={(v) => compact(Number(v))}
          tickLabelProps={() => ({ fill: CHART.textDim, fontSize: 9, textAnchor: 'end', dx: -2, dy: 3, fontFamily: CHART.mono })}
        />
      </Group>
      {/* drawdown */}
      <Group left={MARGIN.left} top={ddTop}>
        <AreaClosed
          data={visible}
          x={(d) => xScale(new Date(d.t))}
          y={(d) => yDd(d.drawdown)}
          y0={() => yDd(0)}
          yScale={yDd}
          fill="url(#dd-fill)"
          stroke={CHART.down}
          strokeWidth={1}
          curve={curveMonotoneX}
        />
        <AxisLeft
          scale={yDd}
          numTicks={2}
          stroke={CHART.axisLine}
          tickStroke={CHART.axisLine}
          tickFormat={(v) => `${Number(v).toFixed(0)}%`}
          tickLabelProps={() => ({ fill: CHART.textDim, fontSize: 9, textAnchor: 'end', dx: -2, dy: 3, fontFamily: CHART.mono })}
        />
        <AxisBottom
          top={ddH}
          scale={xScale}
          numTicks={5}
          stroke={CHART.axisLine}
          tickStroke={CHART.axisLine}
          tickLabelProps={() => ({ fill: CHART.textDim, fontSize: 9, textAnchor: 'middle', fontFamily: CHART.mono })}
        />
      </Group>
      {/* brush */}
      <Group left={MARGIN.left} top={brushTop}>
        <LinePath data={equity} x={(d) => xBrush(new Date(d.t))} y={(d) => (brushH - 2) * (1 - (d.equity - Math.min(...equity.map((e) => e.equity))) / (Math.max(...equity.map((e) => e.equity)) - Math.min(...equity.map((e) => e.equity)) || 1))} stroke={CHART.textDim} strokeWidth={0.75} />
        <Brush
          xScale={xBrush}
          yScale={scaleLinear({ domain: [0, 1], range: [brushH, 0] })}
          width={innerW}
          height={brushH}
          margin={{ top: brushTop, left: MARGIN.left, right: MARGIN.right, bottom: 0 }}
          handleSize={6}
          resizeTriggerAreas={['left', 'right']}
          brushDirection="horizontal"
          onChange={onBrushChange}
          onClick={() => setDomain(null)}
          selectedBoxStyle={{ fill: 'rgba(201,169,110,0.12)', stroke: CHART.brass, strokeWidth: 1 }}
        />
      </Group>
    </svg>
  );
}

const PnLInnerMemo = React.memo(PnLInner);

export function PnLCurve({ equity }: { equity: EquityPoint[] }) {
  return <ParentSize>{({ width, height }) => <PnLInnerMemo width={width} height={height} equity={equity} />}</ParentSize>;
}

import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import type { TradeSetup } from './mockMlDashboardData';

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface SignalPanelProps {
  current: SignalType;
  confidencePct: number;
  recent: { id: string; time: string; signal: SignalType; confidence: number }[];
  tradeSetup: TradeSetup;
  explanationLines: [string, string];
}

const signalStyles: Record<SignalType, string> = {
  BUY: 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 border-2',
  SELL: 'border-rose-400/60 bg-rose-500/20 text-rose-200 border-2',
  HOLD: 'border-amber-400/50 bg-amber-500/18 text-amber-100 border-2',
};

const signalGlow: Record<SignalType, string> = {
  BUY: 'animate-signal-glow-emerald',
  SELL: 'animate-signal-glow-rose',
  HOLD: 'animate-signal-glow-amber',
};

const signalRowStyles: Record<SignalType, string> = {
  BUY: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  SELL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  HOLD: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
};

export const SignalPanel: React.FC<SignalPanelProps> = ({
  current,
  confidencePct,
  recent,
  tradeSetup,
  explanationLines,
}) => {
  const [executing, setExecuting] = useState(false);
  const [lastMock, setLastMock] = useState<string | null>(null);

  const handleMockExecute = () => {
    setExecuting(true);
    setLastMock(null);
    window.setTimeout(() => {
      setExecuting(false);
      setLastMock(`Mock ${current} order queued @ ${new Date().toLocaleTimeString()}`);
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/30 transition-all duration-500 hover:border-fuchsia-500/25 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-fuchsia-400" />
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-fuchsia-300/90">Execution layer</p>
      </div>
      <p className="text-xs text-zinc-500 mb-6">Trade setup · policy narrative · mock route</p>

      <div className="mb-6 flex flex-col items-center sm:items-start">
        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Active signal</span>
        <span
          className={`px-8 py-4 rounded-2xl text-3xl sm:text-4xl font-black tracking-[0.12em] transition-transform duration-300 hover:scale-[1.02] ${signalStyles[current]} ${signalGlow[current]}`}
        >
          {current}
        </span>
        <span className="text-sm text-zinc-400 mt-3 font-mono tabular-nums">{confidencePct}% model confidence</span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-400 mb-2">
          <span title="Composite confidence for this mock policy output">Confidence</span>
          <span className="text-white font-mono tabular-nums">{confidencePct}%</span>
        </div>
        <div className="h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 transition-all duration-700 ease-out"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-6">
        <p className="text-[11px] uppercase tracking-wider text-fuchsia-300/80 mb-3">Trade setup</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <dt className="text-zinc-500" title="Suggested entry (mock), aligned to last print">
              Entry
            </dt>
            <dd className="font-mono text-white tabular-nums text-sm">${tradeSetup.entryPrice.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500" title="Objective price for the mock horizon">
              Target
            </dt>
            <dd className="font-mono text-emerald-300 tabular-nums text-sm">${tradeSetup.targetPrice.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500" title="Protective stop (mock risk unit)">
              Stop loss
            </dt>
            <dd className="font-mono text-rose-300 tabular-nums text-sm">${tradeSetup.stopLoss.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500" title="Reward per unit risk under mock assumptions">
              Risk / reward
            </dt>
            <dd className="font-mono text-cyan-200 tabular-nums text-sm">{tradeSetup.riskRewardRatio}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 mb-6 space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-violet-300/90">Signal explanation</p>
        <p className="text-sm text-zinc-200 leading-relaxed">{explanationLines[0]}</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{explanationLines[1]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">Recent signals</p>
          <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 text-xs transition-colors hover:bg-white/[0.04]"
              >
                <span className="text-zinc-500 font-mono tabular-nums shrink-0">{r.time}</span>
                <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${signalRowStyles[r.signal]}`}>
                  {r.signal}
                </span>
                <span className="text-zinc-400 tabular-nums">{r.confidence}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <button
            type="button"
            onClick={handleMockExecute}
            disabled={executing}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/30 border border-white/10 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none touch-manipulation"
          >
            <Zap className="w-4 h-4" />
            {executing ? 'Routing mock order…' : `Execute mock ${current}`}
          </button>
          {lastMock && <p className="text-xs text-emerald-400/90 font-medium">{lastMock}</p>}
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Front-end only: replace with broker adapter and risk checks when wired.
          </p>
        </div>
      </div>
    </div>
  );
};

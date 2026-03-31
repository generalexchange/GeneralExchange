import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface SignalPanelProps {
  current: SignalType;
  confidencePct: number;
  recent: { id: string; time: string; signal: SignalType; confidence: number }[];
}

const signalStyles: Record<SignalType, string> = {
  BUY: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  SELL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  HOLD: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
};

export const SignalPanel: React.FC<SignalPanelProps> = ({ current, confidencePct, recent }) => {
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-black/30 transition-all hover:border-fuchsia-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-fuchsia-400" />
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-fuchsia-300/90">Execution layer</p>
      </div>
      <p className="text-xs text-zinc-500 mb-5">Policy signal → mock ticket · no connectivity</p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">Signal</span>
        <span
          className={`px-4 py-2 rounded-xl border text-sm font-bold tracking-wide transition-transform hover:scale-[1.02] ${signalStyles[current]}`}
        >
          {current}
        </span>
        <span className="text-xs text-zinc-500 ml-auto font-mono tabular-nums">{confidencePct}% conf.</span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-400 mb-2">
          <span>Confidence</span>
          <span className="text-white font-mono tabular-nums">{confidencePct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
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
                <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${signalStyles[r.signal]}`}>
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
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/30 border border-white/10 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
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

/**
 * Monte Carlo Trolley Problem — educational probability / EV simulation.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export type TrolleyChoice = 'doNothing' | 'pullLever';

export interface RoundRecord {
  roundNumber: number;
  choice: TrolleyChoice;
  deaths: number;
  expectedValue: number;
}

const EV_DO_NOTHING = 0.05 * 0 + 0.95 * 5; // 4.75
const EV_PULL_LEVER = 0.9 * 1 + 0.1 * 3; // 1.2

function sampleDoNothing(): number {
  return Math.random() < 0.05 ? 0 : 5;
}

function samplePullLever(): number {
  return Math.random() < 0.9 ? 1 : 3;
}

function sampleForChoice(choice: TrolleyChoice): number {
  return choice === 'doNothing' ? sampleDoNothing() : samplePullLever();
}

const ROUND_PRESETS = [1, 5, 10, 50, 100] as const;

export const MonteCarlo: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [totalPlanned, setTotalPlanned] = useState(10);
  const [strategy, setStrategy] = useState<'manual' | 'doNothing' | 'pullLever'>('manual');
  const [rounds, setRounds] = useState<RoundRecord[]>([]);
  const [phase, setPhase] = useState<'welcome' | 'choosing' | 'reveal'>('welcome');
  const [lastReveal, setLastReveal] = useState<RoundRecord | null>(null);

  const cumulativeDeaths = useMemo(() => rounds.reduce((s, r) => s + r.deaths, 0), [rounds]);
  const avgDeaths = rounds.length ? cumulativeDeaths / rounds.length : 0;
  const optimalPullPct = rounds.length
    ? Math.round((100 * rounds.filter((r) => r.choice === 'pullLever').length) / rounds.length)
    : 0;

  const chartRows = useMemo(() => {
    let cum = 0;
    return rounds.map((r, i) => {
      cum += r.deaths;
      const n = i + 1;
      return {
        round: n,
        avg: cum / n,
        pullRef: EV_PULL_LEVER,
        nothingRef: EV_DO_NOTHING,
      };
    });
  }, [rounds]);

  const runAutoBatch = useCallback((planned: number, strat: 'doNothing' | 'pullLever') => {
    const next: RoundRecord[] = [];
    for (let i = 0; i < planned; i++) {
      const deaths = sampleForChoice(strat);
      const expectedValue = strat === 'doNothing' ? EV_DO_NOTHING : EV_PULL_LEVER;
      next.push({ roundNumber: i + 1, choice: strat, deaths, expectedValue });
    }
    setRounds(next);
    setPhase('reveal');
  }, []);

  useEffect(() => {
    if (rounds.length === 0) {
      setLastReveal(null);
      return;
    }
    setLastReveal(rounds[rounds.length - 1] ?? null);
  }, [rounds]);

  const commitRound = useCallback((choice: TrolleyChoice) => {
    const deaths = sampleForChoice(choice);
    const expectedValue = choice === 'doNothing' ? EV_DO_NOTHING : EV_PULL_LEVER;
    setRounds((prev) => [...prev, { roundNumber: prev.length + 1, choice, deaths, expectedValue }]);
    setPhase('reveal');
  }, []);

  const continueAfterReveal = useCallback(() => {
    if (!lastReveal) return;
    if (rounds.length >= totalPlanned) return;
    setPhase('choosing');
  }, [lastReveal, rounds.length, totalPlanned]);

  const resetAll = useCallback(() => {
    setRounds([]);
    setPhase('welcome');
  }, []);

  return (
    <div className="min-h-screen bg-[#0c1222] font-sans text-slate-100 antialiased selection:bg-emerald-500/25">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.08] py-8 sm:py-10">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
              <span className="text-emerald-400/90">Simulations</span>
              <span className="text-slate-600"> · </span>
              Probability lab
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
              Monte Carlo Trolley Problem
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Learn probability through ethical dilemmas: compare expected value to realized outcomes, then watch cumulative
              averages converge as rounds add up.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-white"
              >
                Back to home
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-content layout-gutter px-0 py-8 sm:py-10 lg:py-12">
          {phase === 'welcome' && rounds.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-8">
              <h2 className="font-display text-xl font-medium text-white">How it works</h2>
              <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-400">
                <li>
                  <strong className="text-slate-200">Do nothing:</strong> 5% chance of 0 deaths, 95% of 5 — EV{' '}
                  <span className="font-mono text-emerald-300/90">{EV_DO_NOTHING.toFixed(2)}</span>.
                </li>
                <li>
                  <strong className="text-slate-200">Pull lever:</strong> 90% of 1 death, 10% of 3 — EV{' '}
                  <span className="font-mono text-emerald-300/90">{EV_PULL_LEVER.toFixed(2)}</span>.
                </li>
                <li>Play round-by-round, or auto-run a fixed strategy for many rounds and inspect the convergence chart.</li>
              </ul>
              <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rounds per session</p>
                <div className="flex flex-wrap gap-2">
                  {ROUND_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTotalPlanned(n)}
                      className={`min-h-11 min-w-11 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                        totalPlanned === n
                          ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                          : 'border-white/[0.1] bg-white/[0.03] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Strategy</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(
                    [
                      ['manual', 'Manual (you choose each round)'],
                      ['doNothing', 'Auto: always do nothing'],
                      ['pullLever', 'Auto: always pull lever'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setStrategy(id)}
                      className={`min-h-11 rounded-lg border px-3 text-left text-xs font-medium leading-snug transition-colors sm:text-[13px] ${
                        strategy === id
                          ? 'border-sky-400/50 bg-sky-500/10 text-sky-100'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRounds([]);
                    setTotalPlanned(totalPlanned);
                    if (strategy === 'manual') {
                      setPhase('choosing');
                    } else if (strategy === 'doNothing') {
                      runAutoBatch(totalPlanned, 'doNothing');
                    } else {
                      runAutoBatch(totalPlanned, 'pullLever');
                    }
                  }}
                  className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-6 text-sm font-bold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400"
                >
                  {strategy === 'manual' ? 'Start game' : 'Run simulation'}
                </button>
              </div>
            </div>
          ) : null}

          {(phase === 'choosing' || (phase === 'reveal' && rounds.length > 0)) && (
            <div className="space-y-8">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="font-mono text-sm text-slate-400">
                  <span className="text-slate-500">Completed</span>{' '}
                  <span className="tabular-nums text-white">{rounds.length}</span>
                  <span className="text-slate-600"> / </span>
                  <span className="tabular-nums text-white">{totalPlanned}</span> rounds
                  {strategy !== 'manual' ? (
                    <span className="ml-2 text-xs text-slate-500">· auto strategy</span>
                  ) : phase === 'choosing' ? (
                    <span className="ml-2 text-xs text-sky-400/90">· choose below</span>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="min-h-11 rounded-lg border border-white/[0.12] px-4 text-xs font-semibold uppercase tracking-wide text-slate-300 hover:bg-white/[0.05]"
                >
                  Reset / new game
                </button>
              </div>

              {phase === 'choosing' && strategy === 'manual' ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ScenarioCard
                    title="Do nothing"
                    subtitle="Track A — trolley stays on its path"
                    outcomes={[
                      { p: 5, deaths: 0, tone: 'good' as const },
                      { p: 95, deaths: 5, tone: 'bad' as const },
                    ]}
                    expected={EV_DO_NOTHING}
                    variant="secondary"
                    onChoose={() => commitRound('doNothing')}
                    reduceMotion={reduceMotion}
                  />
                  <ScenarioCard
                    title="Pull lever"
                    subtitle="Track B — divert the trolley"
                    outcomes={[
                      { p: 90, deaths: 1, tone: 'caution' as const },
                      { p: 10, deaths: 3, tone: 'warn' as const },
                    ]}
                    expected={EV_PULL_LEVER}
                    variant="primary"
                    onChoose={() => commitRound('pullLever')}
                    reduceMotion={reduceMotion}
                  />
                </div>
              ) : null}

              {phase === 'reveal' && lastReveal ? (
                <div
                  className={`rounded-2xl border border-white/[0.1] bg-slate-900/70 p-6 sm:p-8 ${
                    reduceMotion ? '' : 'transition-opacity duration-300'
                  }`}
                >
                  <h3 className="font-display text-lg font-medium text-white">
                    {strategy === 'manual' ? 'Round outcome' : 'Simulation result'}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {strategy === 'manual' ? (
                      <>
                        You chose{' '}
                        <strong className="text-slate-100">
                          {lastReveal.choice === 'doNothing' ? 'Do nothing' : 'Pull lever'}
                        </strong>
                        .
                      </>
                    ) : (
                      <>
                        Strategy:{' '}
                        <strong className="text-slate-100">
                          {strategy === 'doNothing' ? 'Always do nothing' : 'Always pull lever'}
                        </strong>{' '}
                        · {totalPlanned} rounds simulated.
                      </>
                    )}
                  </p>
                  <p className="mt-4 font-mono text-2xl text-white">
                    <span className="text-slate-500">Deaths this round:</span>{' '}
                    <span
                      className={
                        lastReveal.deaths <= lastReveal.expectedValue + 0.01
                          ? 'text-emerald-400'
                          : 'text-amber-300'
                      }
                    >
                      {lastReveal.deaths}
                    </span>
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-400">
                    Expected (mean): {lastReveal.expectedValue.toFixed(2)} deaths · Actual: {lastReveal.deaths}
                  </p>
                  <p className="mt-4 text-sm text-slate-400">
                    Total deaths so far:{' '}
                    <span className="font-mono text-white">{cumulativeDeaths}</span> across{' '}
                    <span className="font-mono text-white">{rounds.length}</span> round
                    {rounds.length === 1 ? '' : 's'}.
                  </p>
                  {rounds.length < totalPlanned && strategy === 'manual' ? (
                    <button
                      type="button"
                      onClick={continueAfterReveal}
                      className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-sky-500 px-6 text-sm font-bold text-slate-950 transition hover:bg-sky-400 sm:w-auto"
                    >
                      Next round
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetAll}
                      className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/[0.15] px-6 text-sm font-semibold text-white hover:bg-white/[0.06] sm:w-auto"
                    >
                      Play again
                    </button>
                  )}
                </div>
              ) : null}

              {rounds.length > 0 ? (
                <section aria-labelledby="mc-chart-heading" className="space-y-4">
                  <h2 id="mc-chart-heading" className="font-display text-lg font-medium text-white">
                    Convergence — average deaths per round
                  </h2>
                  <p className="max-w-2xl text-xs leading-relaxed text-slate-500">
                    Horizontal lines: mathematical EV if you always pulled the lever ({EV_PULL_LEVER.toFixed(2)}) vs always did
                    nothing ({EV_DO_NOTHING.toFixed(2)}). Your jagged line is the running average of realized outcomes.
                  </p>
                  <div className="h-72 w-full min-h-[280px] rounded-xl border border-white/[0.08] bg-slate-950/50 p-2 sm:p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="round" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'auto']} width={36} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                        <ReferenceLine
                          y={EV_PULL_LEVER}
                          stroke="#34d399"
                          strokeDasharray="5 5"
                          label={{ value: 'EV pull', fill: '#6ee7b7', fontSize: 10 }}
                        />
                        <ReferenceLine
                          y={EV_DO_NOTHING}
                          stroke="#f97316"
                          strokeDasharray="5 5"
                          label={{ value: 'EV nothing', fill: '#fdba74', fontSize: 10 }}
                        />
                        <Line type="monotone" dataKey="avg" name="Cumulative avg" stroke="#38bdf8" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              ) : null}

              {rounds.length > 0 ? (
                <section className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-6 sm:p-8" aria-labelledby="mc-stats">
                  <h2 id="mc-stats" className="font-display text-lg font-medium text-white">
                    Statistics
                  </h2>
                  <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Stat label="Rounds played" value={String(rounds.length)} />
                    <Stat label="Total deaths (actual)" value={String(cumulativeDeaths)} />
                    <Stat label="Average deaths / round" value={avgDeaths.toFixed(3)} mono />
                    <Stat
                      label="Lever pulls (share of rounds)"
                      value={`${optimalPullPct}%`}
                      hint="Pulling every time minimizes long-run expected deaths."
                    />
                  </dl>
                  <p className="mt-6 text-sm leading-relaxed text-slate-400">
                    <strong className="text-emerald-300">Law of large numbers:</strong> over many rounds, your cumulative
                    average tends toward the EV of the strategy you actually play — even when single rounds feel random.
                  </p>
                </section>
              ) : null}
            </div>
          )}
        </main>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

function Stat({ label, value, mono, hint }: { label: string; value: string; mono?: boolean; hint?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={`mt-1 text-lg text-white ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ScenarioCard({
  title,
  subtitle,
  outcomes,
  expected,
  variant,
  onChoose,
  reduceMotion,
}: {
  title: string;
  subtitle: string;
  outcomes: { p: number; deaths: number; tone: 'good' | 'bad' | 'caution' | 'warn' }[];
  expected: number;
  variant: 'primary' | 'secondary';
  onChoose: () => void;
  reduceMotion: boolean | null;
}) {
  const barTone: Record<string, string> = {
    good: 'bg-emerald-500',
    bad: 'bg-rose-500',
    caution: 'bg-amber-400',
    warn: 'bg-orange-500',
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 shadow-lg sm:p-8 ${
        variant === 'primary'
          ? 'border-emerald-400/35 bg-gradient-to-b from-emerald-950/40 to-slate-900/80'
          : 'border-white/[0.1] bg-slate-900/60'
      }`}
    >
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-5 space-y-3">
        {outcomes.map((o) => (
          <div key={`${o.p}-${o.deaths}`}>
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>
                {o.p}% chance:{' '}
                <span className={o.tone === 'good' ? 'text-emerald-300' : o.tone === 'bad' ? 'text-rose-300' : 'text-amber-200'}>
                  {o.deaths} {o.deaths === 1 ? 'death' : 'deaths'}
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${barTone[o.tone]}`}
                style={{ width: `${o.p}%`, transition: reduceMotion ? undefined : 'width 0.4s ease' }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 font-mono text-sm text-slate-300">
        Expected deaths: <span className="text-lg text-white">{expected.toFixed(2)}</span>
      </p>
      <button
        type="button"
        onClick={onChoose}
        className={`mt-auto min-h-12 w-full rounded-xl px-4 text-sm font-bold transition sm:mt-8 ${
          variant === 'primary'
            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            : 'border border-white/[0.15] bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]'
        }`}
      >
        {title}
      </button>
    </div>
  );
}

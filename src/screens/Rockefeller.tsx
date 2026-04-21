/**
 * Rockefeller — markets intelligence wire (Products / Intelligence).
 */

import React from 'react';
import Link from 'next/link';
import { Landmark, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { NewsCard } from '@/components/NewsCard';
import { rockefellerInsights, rockefellerTape } from '@/data/rockefellerInsights';

export const Rockefeller: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0b0d] font-sans text-neutral-100 antialiased">
      <Navbar showSearch={false} />

      <main className="pt-14 sm:pt-[3.75rem]">
        <section className="relative overflow-hidden border-b border-white/[0.07]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(201,169,110,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 20%, rgba(46,90,58,0.12), transparent 50%)',
            }}
            aria-hidden
          />
          <div className="relative max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div className="max-w-3xl space-y-7">
                <div className="flex items-center gap-4">
                  <span className="hidden h-px w-12 bg-tan/60 sm:block" aria-hidden />
                  <div className="inline-flex items-center gap-2 rounded-md border border-tan/30 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                    <Landmark className="h-4 w-4 text-tan" strokeWidth={1.5} aria-hidden />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Rockefeller
                    </span>
                  </div>
                </div>
                <h1 className="font-display text-[2.1rem] leading-[1.05] tracking-tight text-neutral-50 sm:text-5xl lg:text-[3.25rem] font-medium">
                  The morning read for people who still mark the book by hand
                </h1>
                <p className="max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
                  Credit, rates, commodities, and cross-border flow—edited like a private wire: short leads, honest context, and the boring details
                  that actually change risk when everyone else is chasing the headline.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 lg:mb-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Today</p>
                <p className="mt-2 font-display text-2xl text-tan tabular-nums">Rockefeller</p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Intelligence surface for General Exchange. Wire your feeds when ready; this edition ships with curated layout and sample copy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] bg-[#07080a]">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] lg:gap-14">
              <div>
                <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <h2 className="font-display text-xl sm:text-2xl text-neutral-100">Latest briefings</h2>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Wire · mock</span>
                </div>
                <ul className="m-0 list-none space-y-5 p-0">
                  {rockefellerInsights.map((article) => (
                    <li key={article.id}>
                      <NewsCard article={article} variant="insights" />
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="lg:sticky lg:top-24 h-fit space-y-5" aria-label="Opening tape">
                <div className="rounded-xl border border-institutional-green/25 bg-gradient-to-b from-institutional-green/[0.07] to-transparent p-6">
                  <h3 className="font-display text-lg text-neutral-100">Opening tape</h3>
                  <p className="mt-1 text-[11px] text-zinc-500 uppercase tracking-wider">Desk snapshot · illustrative</p>
                  <ul className="mt-5 space-y-3">
                    {rockefellerTape.map((s) => (
                      <li
                        key={s.label}
                        className="flex gap-3 border-l-2 border-tan/35 pl-3 py-1 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-200">{s.label}</p>
                          <p className="mt-0.5 text-xs leading-snug text-zinc-500">{s.detail}</p>
                        </div>
                        <span
                          className={`mt-0.5 shrink-0 text-[10px] uppercase tracking-wider ${
                            s.tone === 'up'
                              ? 'text-institutional-green'
                              : s.tone === 'down'
                                ? 'text-rose-400/85'
                                : 'text-zinc-500'
                          }`}
                        >
                          {s.tone === 'up' ? 'Bid' : s.tone === 'down' ? 'Offer' : 'Mid'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-black/30 p-6">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Rockefeller is the intelligence column for General Exchange—built for readers who want the story and the footnotes in the same
                    envelope.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <Link
                      href="/request-access"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-tan px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted"
                    >
                      Request platform access
                      <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                    <Link
                      href="/coffee"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.12] py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/[0.05]"
                    >
                      Coffee — credit.coffee
                      <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

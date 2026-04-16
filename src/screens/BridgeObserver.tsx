import React from 'react';
import Link from 'next/link';
import { Newspaper, ExternalLink, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { NewsCard } from '../components/NewsCard';
import { bridgeObserverInsights, trendingSignals } from '../data/bridgeObserverInsights';

export const BridgeObserver: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased">
      <Navbar showSearch={false} />

      <main className="pt-14 sm:pt-[3.75rem]">
        <section className="border-b border-white/[0.06] bg-charcoal">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg border border-tan/25 bg-white/[0.03] px-4 py-2">
                <Newspaper className="w-4 h-4 text-tan" strokeWidth={1.5} aria-hidden />
                <span className="font-display text-[11px] font-medium tracking-[0.14em] uppercase text-neutral-400">
                  Bridge Observer
                </span>
              </div>
              <h1 className="font-display text-[2.25rem] sm:text-5xl leading-[1.06] tracking-tight text-neutral-50 font-medium">
                Insights for desks running tokenized compute
              </h1>
              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-light">
                A BlackRock-style reading experience—titles, category tags, excerpts, and clear next steps—so intelligence
                connects to Lubbock.cloud capacity and General Exchange workflows.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] bg-dark-gray/30">
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-10 lg:gap-12 xl:gap-16">
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-neutral-100 mb-8 pb-4 border-b border-white/[0.08]">
                  Latest insights
                </h2>
                <ul className="space-y-6 list-none p-0 m-0">
                  {bridgeObserverInsights.map((article) => (
                    <li key={article.id}>
                      <NewsCard article={article} variant="insights" />
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="lg:sticky lg:top-24 h-fit space-y-6" aria-label="Trending signals">
                <div className="rounded-lg border border-tan/20 bg-charcoal/80 p-6">
                  <h3 className="font-display text-lg text-neutral-100 mb-1">Trending signals</h3>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-6">Live desk telemetry · mock</p>
                  <ul className="space-y-4">
                    {trendingSignals.map((s) => (
                      <li
                        key={s.label}
                        className="flex gap-3 text-sm border-l-2 border-institutional-green/40 pl-3 py-1"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-200">{s.label}</p>
                          <p className="text-neutral-500 text-xs mt-0.5 leading-snug">{s.detail}</p>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] uppercase tracking-wider mt-0.5 ${
                            s.tone === 'up'
                              ? 'text-institutional-green'
                              : s.tone === 'down'
                                ? 'text-rose-400/80'
                                : 'text-neutral-500'
                          }`}
                        >
                          {s.tone === 'up' ? 'Firm' : s.tone === 'down' ? 'Soft' : 'Flat'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-charcoal/60 p-6">
                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                    Bridge Observer is the market intelligence surface for General Exchange. Wire your external feed when
                    ready; this page ships with curated copy and layout.
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://bridgeobserver.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-tan text-charcoal text-sm font-semibold hover:bg-tan-muted transition-colors"
                    >
                      Open bridgeobserver.com
                      <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                    <Link
                      href="/request-access"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/[0.12] text-neutral-200 text-sm font-semibold hover:bg-white/[0.05] transition-colors"
                    >
                      Request platform access
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
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

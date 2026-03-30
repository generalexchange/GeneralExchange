import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';

export const BridgeObserver: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0f] font-sans text-neutral-100 antialiased">
      <SEO
        title="Bridge Observer - Market Wire and Context"
        description="Bridge Observer is the contextual wire for General Exchange: curated headlines, desk context, and governance-aware operational updates."
        canonical="https://generalexchange.com/bridge-observer"
      />
      <Navbar showSearch={false} />

      <main className="pt-14 sm:pt-[3.75rem]">
        <section className="border-b border-white/[0.06] bg-[#0b0c0f]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2">
                <Newspaper className="w-4 h-4 text-[#c6a575]" aria-hidden />
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-300">
                  Bridge Observer
                </span>
              </div>
              <h1 className="font-display text-[2.2rem] sm:text-5xl leading-[1.08] tracking-[-0.02em] text-neutral-50">
                Contextual market wire for institutional execution
              </h1>
              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
                Bridge Observer is where your desk context, risk language, and market narrative meet. It is built to plug into
                your General Exchange workflows so updates become decisions, not noise.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] bg-[#101216]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-500 mb-3">Signal context</p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Headlines tied to instrument, venue, and model impact so traders can map narrative to exposure quickly.
                </p>
              </article>
              <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-500 mb-3">Governance trace</p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Published updates align with desk taxonomy and review paths to keep research, risk, and second line synchronized.
                </p>
              </article>
              <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-500 mb-3">Delivery path</p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Use this page as the product entry point while your external domain and live feed pipeline are finalized.
                </p>
              </article>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="https://bridgeobserver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#c6a575] text-[#0b0c0f] text-sm font-semibold hover:bg-[#d4b896] transition-colors"
              >
                Open bridgeobserver.com
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                to="/request-access"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/[0.14] text-neutral-200 text-sm font-semibold hover:bg-white/[0.06] transition-colors"
              >
                Request platform access
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

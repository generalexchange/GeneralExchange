/**
 * Newsletter — product updates and market brief sign-up
 */

import React from 'react';
import { Mail } from 'lucide-react';
import { PlatformPageShell } from '../components/PlatformPageShell';
import { SEO } from '../components/SEO';

export const Newsletter: React.FC = () => {
  return (
    <PlatformPageShell>
      <SEO
        title="Newsletter — General Exchange"
        description="Subscribe to General Exchange for product updates, platform notes, and curated market context."
        keywords="General Exchange newsletter, trading platform updates"
        canonical="https://generalexchange.com/newsletter"
      />
      <section className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <Mail className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">Newsletter</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">Stay in the loop</h1>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Product releases, risk-engine notes, and Bridge Observer highlights—concise and infrequent.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="flex-1 px-4 py-3 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-6">We respect your inbox. Unsubscribe anytime.</p>
        </div>
      </section>
    </PlatformPageShell>
  );
};

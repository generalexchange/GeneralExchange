'use client';

import React from 'react';

/**
 * Compact newsletter signup for the marketing footer (replaces static tagline pill).
 */
export function FooterNewsletterSignup() {
  return (
    <div className="mt-4 max-w-sm rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800/80">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Newsletter</p>
      <p className="mt-1 text-[12px] font-light leading-snug text-neutral-600 dark:text-neutral-400">
        Product notes, risk-engine updates, and Monte Carlo releases—brief and infrequent.
      </p>
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email for newsletter
        </label>
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className="min-h-10 w-full flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-500"
        />
        <button
          type="submit"
          className="min-h-10 shrink-0 rounded-md bg-neutral-900 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          Subscribe
        </button>
      </form>
      <p className="mt-2 text-[10px] font-light text-neutral-400 dark:text-neutral-500">Unsubscribe anytime. No spam.</p>
    </div>
  );
}

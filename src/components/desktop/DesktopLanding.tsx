'use client';

/**
 * DesktopLanding — shown instead of the homepage when running inside the
 * Tauri desktop shell. Displays the full-bleed illustration with animated
 * "Sign In" / "Create Account" buttons that rise from the bottom.
 *
 * After the user taps a button they are routed to the web login or request-
 * access page, which are both bundled inside the desktop app.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DESKTOP_APP_VERSION } from '@/config/desktopApp';

const easeLux = [0.22, 1, 0.36, 1] as const;

export function DesktopLanding() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0e0f13]">
      {/* Full-bleed illustration */}
      <div className="absolute inset-0">
        <Image
          src="/images/generalexchangehorse.png"
          alt="general.exchange"
          fill
          priority
          className="object-cover brightness-[0.48] contrast-[1.22] saturate-[0.75] sepia-[0.18]"
        />
        {/* Dark vignette so text is always readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(14,15,19,0.35) 0%, rgba(14,15,19,0.1) 38%, rgba(14,15,19,0.75) 70%, rgba(14,15,19,0.97) 100%)',
          }}
          aria-hidden
        />
        {/* Subtle green tint at top */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(46,90,58,0.22),transparent_60%)]"
          aria-hidden
        />
      </div>

      {/* Top branding */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-8 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeLux, delay: 0.15 }}
      >
        <div>
          <p className="font-display text-[22px] font-normal tracking-[-0.01em] text-neutral-100">
            general.exchange
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-tan/60">
            By: Old West Solutions
          </p>
        </div>
      </motion.div>

      {/* Bottom content — wordmark + CTAs */}
      <div className="relative z-10 mt-auto px-8 pb-14">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeLux, delay: 0.3 }}
        >
          <h1 className="font-display text-[clamp(2rem,6vw,3.2rem)] font-normal leading-[1.06] tracking-[-0.025em] text-neutral-50">
            The institutional
            <br />
            trading terminal.
          </h1>
          <p className="mt-4 max-w-sm text-[14px] leading-[1.72] text-zinc-400">
            Research, backtest, and execute — connected to Interactive Brokers,
            powered by real market data.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeLux, delay: 0.48 }}
        >
          <Link
            href="/login"
            className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-md bg-tan px-8 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.45)] transition-all hover:bg-tan-muted active:scale-[0.99]"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.p
          className="mt-6 text-[11px] text-zinc-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          v{DESKTOP_APP_VERSION}
        </motion.p>
      </div>
    </div>
  );
}

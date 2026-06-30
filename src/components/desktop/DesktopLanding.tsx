'use client';

/**
 * Desktop splash — centered hero + inline login (no marketing homepage).
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DESKTOP_APP_VERSION } from '@/config/desktopApp';
import { DESKTOP_LEGEND_PATH } from '@/lib/desktopNav';

const easeLux = [0.22, 1, 0.36, 1] as const;

export function DesktopLanding() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      router.replace(DESKTOP_LEGEND_PATH);
    }, 700);
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#0e0f13]">
      <div className="absolute inset-0">
        <Image
          src="/images/generalexchangehorse.png"
          alt="general.exchange"
          fill
          priority
          className="object-cover object-[center_35%] brightness-[0.48] contrast-[1.22] saturate-[0.75] sepia-[0.18]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(14,15,19,0.55) 0%, rgba(14,15,19,0.25) 40%, rgba(14,15,19,0.75) 100%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_45%,rgba(46,90,58,0.18),transparent_65%)]"
          aria-hidden
        />
      </div>

      <motion.header
        className="relative z-10 flex shrink-0 items-center justify-between px-6 py-5 sm:px-10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeLux }}
      >
        <div>
          <p className="font-display text-xl tracking-tight text-neutral-100 sm:text-[22px]">general.exchange</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-tan/60">Legend terminal</p>
        </div>
        <p className="font-mono text-[11px] text-zinc-500">v{DESKTOP_APP_VERSION}</p>
      </motion.header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8">
        <motion.div
          className="w-full max-w-[460px]"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: easeLux, delay: 0.12 }}
        >
          <div className="mb-5 text-center sm:mb-6">
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] font-normal tracking-tight text-neutral-50">
              Sign in to Legend
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
              Local terminal · IBKR on your machine
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.12] bg-[#0e0f13]/80 p-6 shadow-[0_40px_100px_-32px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-wider text-zinc-500">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-lg border border-white/[0.1] bg-black/40 px-4 text-base text-neutral-100 placeholder-zinc-600 outline-none transition-colors focus:border-brass/50 sm:text-[15px]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-wider text-zinc-500">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-lg border border-white/[0.1] bg-black/40 px-4 pr-12 text-base text-neutral-100 placeholder-zinc-600 outline-none transition-colors focus:border-brass/50 sm:text-[15px]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-500 hover:text-zinc-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-tan text-base font-semibold tracking-wide text-charcoal transition hover:bg-tan-muted disabled:bg-white/10 disabled:text-zinc-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Opening Legend…
                  </>
                ) : (
                  'Enter terminal'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSubmitting ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#0e0f13]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-charcoal/90 px-8 py-6"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-tan" />
              <p className="font-mono text-sm text-zinc-300">Connecting to IBKR feed…</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

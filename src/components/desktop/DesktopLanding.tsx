'use client';

/**
 * Desktop splash — full-bleed homepage hero with inline login (no marketing homepage).
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
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
      setIsSubmitting(false);
      router.replace(DESKTOP_LEGEND_PATH);
    }, 600);
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0e0f13]">
      <div className="absolute inset-0">
        <Image
          src="/images/generalexchangehorse.png"
          alt="general.exchange"
          fill
          priority
          className="object-cover brightness-[0.48] contrast-[1.22] saturate-[0.75] sepia-[0.18]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(14,15,19,0.4) 0%, rgba(14,15,19,0.15) 35%, rgba(14,15,19,0.82) 65%, rgba(14,15,19,0.98) 100%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(46,90,58,0.22),transparent_60%)]"
          aria-hidden
        />
      </div>

      <motion.div
        className="relative z-10 flex items-center justify-between px-8 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeLux, delay: 0.1 }}
      >
        <div>
          <p className="font-display text-[22px] font-normal tracking-[-0.01em] text-neutral-100">
            general.exchange
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-tan/60">Legend terminal</p>
        </div>
        <p className="font-mono text-[10px] text-zinc-600">v{DESKTOP_APP_VERSION}</p>
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-6 pb-10 sm:px-8 sm:pb-14">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeLux, delay: 0.25 }}
        >
          <div className="rounded-2xl border border-white/[0.1] bg-[#0e0f13]/75 p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-7">
            <p className="text-center font-display text-xl tracking-tight text-neutral-50">Sign in</p>
            <p className="mt-1.5 text-center text-[13px] text-zinc-500">Local terminal · IBKR on your machine</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-zinc-500">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-white/[0.09] bg-black/35 px-3.5 text-sm text-neutral-100 placeholder-zinc-600 outline-none focus:border-brass/50"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-zinc-500">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 w-full rounded-lg border border-white/[0.09] bg-black/35 px-3.5 pr-10 text-sm text-neutral-100 placeholder-zinc-600 outline-none focus:border-brass/50"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-tan text-sm font-semibold tracking-wide text-charcoal transition hover:bg-tan-muted disabled:bg-white/10 disabled:text-zinc-500"
              >
                {isSubmitting ? 'Opening Legend…' : 'Enter terminal'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

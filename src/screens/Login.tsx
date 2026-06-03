'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const easeLux = [0.22, 1, 0.36, 1] as const;

export const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-charcoal">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(46,90,58,0.13),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_92%_90%,rgba(210,180,140,0.07),transparent_55%)]"
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-7 w-7 overflow-hidden rounded-md border border-[#8B7D6B]/45">
            <Image
              src="/images/generalexchangehorse.png"
              alt="general.exchange"
              width={28}
              height={28}
              className="h-full w-full object-cover brightness-[0.68] contrast-[1.25] saturate-[0.82] sepia-[0.12]"
            />
          </div>
          <span className="font-display text-[15px] tracking-[-0.01em] text-neutral-200 transition-colors group-hover:text-tan">
            General Exchange
          </span>
        </Link>
        <p className="hidden text-[11px] uppercase tracking-[0.2em] text-zinc-500 sm:block">
          By: Old West Solutions
        </p>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeLux }}
        >
          {/* Eyebrow */}
          <p className="sc-serif mb-3 text-[11px] uppercase tracking-[0.22em] text-tan/75">
            Terminal access
          </p>

          <h1 className="font-display text-[clamp(1.6rem,4vw,2.1rem)] font-normal leading-[1.08] tracking-[-0.02em] text-neutral-50">
            Welcome back.
          </h1>
          <p className="mt-2.5 text-[14px] leading-[1.65] text-zinc-400">
            Sign in to your general.exchange account.
          </p>

          {/* Card */}
          <div className="mt-8 rounded-xl border border-white/[0.07] bg-dark-gray shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7)]">
            <form onSubmit={handleSubmit} className="space-y-4 p-7 sm:p-8">
              {/* Email */}
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">
                  Email address
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-md border border-white/[0.09] bg-black/30 px-3.5 text-sm text-neutral-100 placeholder-zinc-600 outline-none transition-colors focus:border-brass/50 focus:ring-1 focus:ring-brass/20"
                />
              </label>

              {/* Password */}
              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                    Password
                  </span>
                  <a
                    href="#"
                    className="text-[11px] text-zinc-500 transition-colors hover:text-tan"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 w-full rounded-md border border-white/[0.09] bg-black/30 px-3.5 pr-10 text-sm text-neutral-100 placeholder-zinc-600 outline-none transition-colors focus:border-brass/50 focus:ring-1 focus:ring-brass/20"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-tan text-sm font-semibold tracking-wide text-charcoal shadow-[0_8px_24px_-8px_rgba(210,180,140,0.35)] transition-all hover:bg-tan-muted active:scale-[0.99] disabled:bg-white/10 disabled:text-zinc-500 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="border-t border-white/[0.06] px-7 py-5 sm:px-8">
              <p className="text-center text-[13px] text-zinc-500">
                No account?{' '}
                <Link
                  href="/request-access"
                  className="font-semibold text-tan/90 transition-colors hover:text-tan"
                >
                  Request access
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-zinc-600">
            By signing in you agree to our{' '}
            <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-5 text-center">
        <p className="text-[12px] text-zinc-600">
          © {new Date().getFullYear()} Old West Solutions. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

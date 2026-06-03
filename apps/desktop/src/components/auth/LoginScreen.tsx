import React, { useState } from 'react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { setStoredAuth, openExternal } from '@/lib/tauri';
import { WEB_APP_URL } from '@/lib/constants';

export const LoginScreen: React.FC = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.login(email, password);
      await setStoredAuth(res.token, res.refreshToken);
      setSession(res);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Sign in failed';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-charcoal">
      <div className="w-[360px] rounded-lg border border-white/[0.08] bg-dark-gray p-8 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
        <p className="font-display text-2xl text-neutral-50">General Exchange</p>
        <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-tan/80">Terminal</p>

        <form onSubmit={onSubmit} className="mt-7 space-y-3">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Email</span>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded border border-white/10 bg-black/30 px-3 text-sm text-neutral-100 outline-none focus:border-brass/50"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-10 w-full rounded border border-white/10 bg-black/30 px-3 text-sm text-neutral-100 outline-none focus:border-brass/50"
            />
          </label>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="h-10 w-full rounded-md bg-tan text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted disabled:bg-white/10 disabled:text-zinc-500"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => openExternal(WEB_APP_URL)}
          className="mt-4 w-full text-center text-[12px] text-zinc-500 underline-offset-4 hover:text-tan hover:underline"
        >
          Open in Browser
        </button>
      </div>
    </div>
  );
};

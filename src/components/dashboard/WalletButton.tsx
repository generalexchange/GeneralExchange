'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LogOut, Wallet } from 'lucide-react';
import { TOKEN_ECONOMICS } from '@/config/tokenEconomics';

// TODO: wire SPL token balance fetch when NEXT_PUBLIC_GE_TOKEN_MINT is configured
// TODO: wire USDC balance via token account when NEXT_PUBLIC_USDC_MINT is configured

export function WalletButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const short = publicKey ? publicKey.toBase58().slice(-4) : '';
  const walletEnabled = Boolean(TOKEN_ECONOMICS.rpcUrl);

  const connect = () => {
    if (!walletEnabled) return;
    setVisible(true);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (connected ? setOpen((v) => !v) : connect())}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-dark-gray px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-tan/30 hover:text-tan"
      >
        <Wallet className="h-4 w-4 shrink-0" />
        {connected ? (
          <span className="font-mono tabular-nums">
            …{short} · — {TOKEN_ECONOMICS.tokenSymbol}
          </span>
        ) : (
          <span>Connect</span>
        )}
      </button>

      {open && connected && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-white/10 bg-charcoal shadow-xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Wallet</p>
            <p className="mt-1 break-all font-mono text-[11px] text-zinc-300">{publicKey?.toBase58()}</p>
          </div>
          <div className="space-y-2 px-4 py-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">{TOKEN_ECONOMICS.tokenSymbol}</span>
              <span className="text-tan">
                {TOKEN_ECONOMICS.tokenMintAddress ? 'Loading…' : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">USDC</span>
              <span className="text-zinc-200">
                {TOKEN_ECONOMICS.usdcMintAddress ? 'Loading…' : '—'}
              </span>
            </div>
          </div>
          <div className="border-t border-white/10 px-4 py-2">
            <p className="font-mono text-[10px] text-zinc-600">Transaction history requires on-chain integration.</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-white/10 p-2">
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-center text-xs font-semibold text-tan hover:bg-white/5"
            >
              Buy Tokens
            </Link>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

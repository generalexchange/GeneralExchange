'use client';

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight, Wallet } from 'lucide-react';

const btnPrimary =
  'inline-flex min-h-11 items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99]';
const btnOutline =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99]';

export function TokenHero() {
  const { publicKey } = useWallet();
  const shortAddr = publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : null;

  return (
    <div className="mx-auto max-w-content px-4 pb-16 pt-24 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
      <p className="sc-serif text-[11px] uppercase tracking-[0.2em] text-brass">General Exchange Tokens</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-neutral-100 sm:text-5xl lg:text-6xl">
        Purchase General Exchange Tokens
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
        Use General Exchange tokens to access premium platform functionality, decentralized storage services,
        research tools, and future marketplace features.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a href="#purchase" className={btnPrimary}>
          Buy Tokens
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
        <WalletMultiButton className="!h-11 !rounded-md !bg-transparent !font-semibold !text-zinc-200 !border !border-brass/50 hover:!border-brass hover:!bg-brass/5 hover:!text-tan" />
      </div>
      {shortAddr && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 font-mono text-[12px] text-moss">
          <Wallet className="h-3.5 w-3.5" />
          Connected · {shortAddr}
        </p>
      )}
    </div>
  );
}

export { btnPrimary, btnOutline };

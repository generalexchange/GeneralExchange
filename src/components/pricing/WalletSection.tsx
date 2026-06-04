'use client';

import React from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TOKEN_ECONOMICS } from '@/config/tokenEconomics';

export function WalletSection() {
  const { publicKey, connected } = useWallet();

  return (
    <SectionShell
      eyebrowNum="04"
      eyebrowLabel="Wallet"
      title="Wallet integration"
      lede="Connect Phantom or Solflare to view your address and token balance."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-6">
          <h3 className="text-sm font-semibold text-neutral-100">Supported wallets</h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>Phantom Wallet</li>
            <li>Solflare Wallet</li>
          </ul>
          <div className="mt-6">
            <WalletMultiButton className="!rounded-md !bg-tan !font-semibold !text-charcoal hover:!bg-tan-muted" />
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-6 font-mono text-[12px]">
          <h3 className="text-sm font-semibold font-sans text-neutral-100">Account</h3>
          {connected && publicKey ? (
            <dl className="mt-4 space-y-3 text-zinc-400">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Address</dt>
                <dd className="mt-1 break-all text-zinc-200">{publicKey.toBase58()}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Token balance</dt>
                <dd className="mt-1 text-tan">
                  {TOKEN_ECONOMICS.tokenMintAddress
                    ? 'Balance loads when mint is configured'
                    : 'Configure NEXT_PUBLIC_GE_TOKEN_MINT for on-chain balance'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Recent transactions</dt>
                <dd className="mt-1 text-zinc-500">No transactions yet</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-zinc-500">Connect a wallet to view account details.</p>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

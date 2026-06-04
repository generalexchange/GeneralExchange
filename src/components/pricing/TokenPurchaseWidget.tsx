'use client';

import React, { useMemo, useState } from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';
import { TOKEN_ECONOMICS, type PaymentMethod } from '@/config/tokenEconomics';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreditCard } from 'lucide-react';

export function TokenPurchaseWidget() {
  const { connected } = useWallet();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('USDC');
  const [inputMode, setInputMode] = useState<'tokens' | 'usd'>('tokens');
  const [amount, setAmount] = useState('100');

  const parsed = Number(amount) || 0;
  const estimatedTokens = useMemo(() => {
    if (inputMode === 'tokens') return parsed;
    return parsed / TOKEN_ECONOMICS.usdPerToken;
  }, [parsed, inputMode]);

  const estimatedUsd = useMemo(() => {
    if (inputMode === 'usd') return parsed;
    return parsed * TOKEN_ECONOMICS.usdPerToken;
  }, [parsed, inputMode]);

  const canPurchase = connected && estimatedTokens >= TOKEN_ECONOMICS.minTokens;

  return (
    <SectionShell
      id="purchase"
      eyebrowNum="03"
      eyebrowLabel="Purchase"
      title="Token purchase"
      lede="Select a payment method and amount. On-chain settlement connects when the SPL mint is deployed."
      tone="secondary"
    >
      <div className="mx-auto max-w-xl rounded-lg border border-white/[0.08] bg-charcoal/65 p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Payment method</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['USDC', 'SOL'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`rounded-md border px-4 py-2 font-mono text-sm transition-colors ${
                    paymentMethod === m
                      ? 'border-tan/50 bg-tan/15 text-tan'
                      : 'border-white/[0.1] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m}
                </button>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/[0.12] px-4 py-2 font-mono text-sm text-zinc-600">
                <CreditCard className="h-3.5 w-3.5" />
                Credit Card (Coming Soon)
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Amount</label>
              <div className="flex gap-1 rounded-md border border-white/[0.08] p-0.5">
                {(['tokens', 'usd'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setInputMode(mode)}
                    className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      inputMode === mode ? 'bg-white/[0.08] text-tan' : 'text-zinc-500'
                    }`}
                  >
                    {mode === 'tokens' ? 'Tokens' : 'USD'}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/[0.1] bg-dark-gray px-4 py-3 font-mono text-lg text-neutral-100 focus:border-tan/40 focus:outline-none"
              placeholder={inputMode === 'tokens' ? 'Number of tokens' : 'Dollar amount'}
            />
            <p className="mt-2 font-mono text-[12px] text-zinc-400">
              Estimated:{' '}
              <span className="text-tan">{estimatedTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })} GEX</span>
              {' · '}$
              {estimatedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Min. {TOKEN_ECONOMICS.minTokens} tokens · ${TOKEN_ECONOMICS.usdPerToken.toFixed(2)}/token (config)
            </p>
          </div>

          {!connected ? (
            <div className="text-center">
              <p className="mb-3 text-sm text-zinc-400">Connect a wallet to purchase tokens.</p>
              <WalletMultiButton className="!mx-auto !rounded-md !bg-tan !font-semibold !text-charcoal hover:!bg-tan-muted" />
            </div>
          ) : (
            <button
              type="button"
              disabled={!canPurchase}
              className="w-full rounded-md bg-tan py-3.5 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              {canPurchase
                ? `Purchase with ${paymentMethod} (smart contract pending)`
                : `Minimum ${TOKEN_ECONOMICS.minTokens} tokens required`}
            </button>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

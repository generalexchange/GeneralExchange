'use client';

import React from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';
import { TOKEN_ECONOMICS } from '@/config/tokenEconomics';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-5 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums text-tan">{value}</p>
    </div>
  );
}

export function TokenEconomicsSection() {
  const fmt = (n: number) => n.toLocaleString('en-US');

  return (
    <SectionShell
      eyebrowNum="06"
      eyebrowLabel="Economics"
      title="Token economics"
      lede="Supply metrics are loaded from configuration and will sync with on-chain state when deployed."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total supply" value={fmt(TOKEN_ECONOMICS.totalSupply)} />
        <Metric label="Circulating supply" value={fmt(TOKEN_ECONOMICS.circulatingSupply)} />
        <Metric label="Treasury balance" value={fmt(TOKEN_ECONOMICS.treasuryBalance)} />
        <Metric label="Tokens burned" value={fmt(TOKEN_ECONOMICS.tokensBurned)} />
      </div>
    </SectionShell>
  );
}

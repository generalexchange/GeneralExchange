'use client';

import React from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';
import { INFRA_CARDS } from '@/config/tokenEconomics';

export function InfrastructureSection() {
  return (
    <SectionShell
      eyebrowNum="02"
      eyebrowLabel="Infrastructure"
      title="Powered by modern infrastructure"
      lede="Solana for settlement, Filecoin for durable storage, and Circle for stablecoin rails."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {INFRA_CARDS.map((card) => (
          <article key={card.id} className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-6">
            <h3 className="font-display text-xl text-tan">{card.title}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Use {card.title} for</p>
            <ul className="mt-4 space-y-2">
              {card.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

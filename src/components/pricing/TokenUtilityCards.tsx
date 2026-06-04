'use client';

import React from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';
import { TOKEN_UTILITY } from '@/config/tokenEconomics';
import { Database, LineChart, ShoppingBag, Zap } from 'lucide-react';

const ICONS = { research: LineChart, storage: Database, marketplace: ShoppingBag, api: Zap } as const;

export function TokenUtilityCards() {
  return (
    <SectionShell
      eyebrowNum="01"
      eyebrowLabel="Utility"
      title="What tokens are used for"
      lede="General Exchange tokens pay for storage, API access, and platform services — not equity or investment returns."
      tone="secondary"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOKEN_UTILITY.map((card) => {
          const Icon = ICONS[card.id as keyof typeof ICONS];
          return (
            <article
              key={card.id}
              className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-5 transition-colors hover:border-brass/30"
            >
              <Icon className="h-5 w-5 text-brass" strokeWidth={1.5} />
              <h3 className="mt-4 text-base font-semibold text-neutral-100">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{card.description}</p>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

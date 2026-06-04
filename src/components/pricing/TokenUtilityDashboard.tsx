'use client';

import React from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';

const CREDITS = [
  { label: 'Storage Credits', value: '—', hint: 'Filecoin-backed archives' },
  { label: 'Research Credits', value: '—', hint: 'Premium intelligence' },
  { label: 'API Credits', value: '—', hint: 'Data & compute requests' },
] as const;

const HISTORY = [
  { spent: '—', service: 'Connect wallet to view usage', at: '—' },
] as const;

export function TokenUtilityDashboard() {
  return (
    <SectionShell
      eyebrowNum="05"
      eyebrowLabel="Usage"
      title="Token utility dashboard"
      lede="Track available credits and consumption history once your wallet is linked to the platform ledger."
      tone="secondary"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-6">
          <h3 className="text-sm font-semibold text-neutral-100">Available credits</h3>
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {CREDITS.map((c) => (
              <li key={c.label} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-zinc-200">{c.label}</p>
                  <p className="text-[11px] text-zinc-600">{c.hint}</p>
                </div>
                <span className="font-mono text-lg text-tan">{c.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-charcoal/65 p-6">
          <h3 className="text-sm font-semibold text-neutral-100">Consumption history</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full font-mono text-[11px]">
              <thead>
                <tr className="text-left text-zinc-600">
                  <th className="pb-2 pr-4">Tokens spent</th>
                  <th className="pb-2 pr-4">Service</th>
                  <th className="pb-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                {HISTORY.map((row, i) => (
                  <tr key={i} className="border-t border-white/[0.06]">
                    <td className="py-2 pr-4">{row.spent}</td>
                    <td className="py-2 pr-4">{row.service}</td>
                    <td className="py-2">{row.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

'use client';

import React from 'react';
import { SectionShell } from '@/components/homepage/SectionShell';
import { COMPLIANCE_DISCLAIMER } from '@/config/tokenEconomics';

export function ComplianceDisclaimer() {
  return (
    <SectionShell
      eyebrowNum="07"
      eyebrowLabel="Disclosures"
      title="Compliance"
      tone="secondary"
      verticalRhythm="lastOnPage"
    >
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">{COMPLIANCE_DISCLAIMER}</p>
    </SectionShell>
  );
}

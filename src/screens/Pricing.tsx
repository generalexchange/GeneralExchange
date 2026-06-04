/**
 * Pricing — token purchase and utility page (not SaaS subscriptions).
 */

'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { SolanaWalletProvider } from '@/providers/SolanaWalletProvider';
import { TokenHero } from '@/components/pricing/TokenHero';
import { TokenUtilityCards } from '@/components/pricing/TokenUtilityCards';
import { InfrastructureSection } from '@/components/pricing/InfrastructureSection';
import { TokenPurchaseWidget } from '@/components/pricing/TokenPurchaseWidget';
import { WalletSection } from '@/components/pricing/WalletSection';
import { TokenUtilityDashboard } from '@/components/pricing/TokenUtilityDashboard';
import { TokenEconomicsSection } from '@/components/pricing/TokenEconomicsSection';
import { ComplianceDisclaimer } from '@/components/pricing/ComplianceDisclaimer';

function PricingContent() {
  return (
    <div className="min-h-screen bg-charcoal text-zinc-100">
      <Navbar />
      <TokenHero />
      <TokenUtilityCards />
      <InfrastructureSection />
      <TokenPurchaseWidget />
      <WalletSection />
      <TokenUtilityDashboard />
      <TokenEconomicsSection />
      <ComplianceDisclaimer />
      <InstitutionalFooter />
    </div>
  );
}

export const Pricing: React.FC = () => (
  <SolanaWalletProvider>
    <PricingContent />
  </SolanaWalletProvider>
);

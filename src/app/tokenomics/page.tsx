import type { Metadata } from 'next';
import { Tokenomics } from '@/screens/Tokenomics';

export const metadata: Metadata = {
  title: 'Tokenomics',
  description:
    'Tokenization layer for narrative intelligence, entitlement contracts, and risk fabric—plus tokenized compute, wallets, yield, and scheduler policy on one ledger.',
  alternates: { canonical: '/tokenomics' },
};

export default function TokenomicsPage() {
  return <Tokenomics />;
}

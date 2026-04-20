import type { Metadata } from 'next';
import { FixedIncome } from '@/screens/FixedIncome';

export const metadata: Metadata = {
  title: 'Fixed Income',
  description:
    'Rates, credit spreads, and carry on one surface—manifest-tagged runs for curve trades, issuer baskets, and RV sleeves.',
  alternates: { canonical: '/fixed-income' },
};

export default function FixedIncomePage() {
  return <FixedIncome />;
}

import type { Metadata } from 'next';
import { FixedIncome } from '@/screens/FixedIncome';

export const metadata: Metadata = {
  title: 'Fixed Income',
  description:
    'Fixed income on General Exchange—rates, credit, yield curves, and dividend-style cash flows with manifest-bound simulation and education.',
  alternates: { canonical: '/fixed-income' },
};

export default function FixedIncomePage() {
  return <FixedIncome />;
}

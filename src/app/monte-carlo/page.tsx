import type { Metadata } from 'next';
import { MonteCarlo } from '@/screens/MonteCarlo';

export const metadata: Metadata = {
  title: 'Monte Carlo Trolley Problem',
  description:
    'Interactive probability lab: expected value, risk trade-offs, and the law of large numbers through a gamified trolley dilemma.',
  alternates: { canonical: '/monte-carlo' },
};

export default function MonteCarloPage() {
  return <MonteCarlo />;
}

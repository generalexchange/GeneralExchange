import type { Metadata } from 'next';
import { Pricing } from '@/screens/Pricing';

export const metadata: Metadata = {
  title: 'Compute tokens',
  description:
    'Tokenized GPU tiers for training, inference, Monte Carlo, and risk grids—priced transparently per GPU-hour.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <Pricing />;
}

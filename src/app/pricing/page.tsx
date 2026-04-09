import type { Metadata } from 'next';
import { Pricing } from '@/screens/Pricing';

export const metadata: Metadata = {
  title: 'Compute tokens',
  description:
    'LUB-MI300X, LUB-MI325X, and LUB-MI355X tokenized AMD compute for training, inference, and Monte Carlo—priced per GPU-hour.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <Pricing />;
}

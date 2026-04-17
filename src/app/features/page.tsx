import type { Metadata } from 'next';
import { Features } from '@/screens/Features';

export const metadata: Metadata = {
  title: 'Trading tools',
  description:
    'Backtesting, Monte Carlo simulation, risk modelling, and strategy builder—powered by tokenized GPU compute on the platform.',
  alternates: { canonical: '/features' },
};

export default function FeaturesPage() {
  return <Features />;
}

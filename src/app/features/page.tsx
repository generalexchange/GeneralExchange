import type { Metadata } from 'next';
import { Features } from '@/screens/Features';

export const metadata: Metadata = {
  title: 'Trading tools',
  description:
    'Backtesting, Monte Carlo simulation, risk modelling, and strategy builder—powered by tokenized AMD compute via Lubbock.cloud.',
  alternates: { canonical: '/features' },
};

export default function FeaturesPage() {
  return <Features />;
}

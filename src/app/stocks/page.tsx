import type { Metadata } from 'next';
import { Stocks } from '@/screens/Stocks';

export const metadata: Metadata = {
  title: 'Stocks',
  description:
    'Stock solutions on General Exchange—equity simulation, session rules, and manifest-bound runs aligned with risk and research.',
  alternates: { canonical: '/stocks' },
};

export default function StocksPage() {
  return <Stocks />;
}

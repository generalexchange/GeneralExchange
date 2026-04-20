import type { Metadata } from 'next';
import { Futures } from '@/screens/Futures';

export const metadata: Metadata = {
  title: 'Futures',
  description:
    'Futures solutions on General Exchange—margins, rolls, spreads, and replayable scenarios with manifest-bound runs.',
  alternates: { canonical: '/futures' },
};

export default function FuturesPage() {
  return <Futures />;
}

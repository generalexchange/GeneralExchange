import type { Metadata } from 'next';
import { TradeEngine } from '@/screens/TradeEngine';

export const metadata: Metadata = {
  title: 'The Exchange',
  description:
    'General Exchange execution surface: tickets, routing, and policy-aware checks so intent becomes a controlled release before size hits the tape.',
  alternates: { canonical: '/trade-engine' },
};

export default function TradeEnginePage() {
  return <TradeEngine />;
}

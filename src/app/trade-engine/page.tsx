import type { Metadata } from 'next';
import { TradeEngine } from '@/screens/TradeEngine';

export const metadata: Metadata = {
  title: 'TradeEngine',
  description:
    'Institutional order workflow: strategy intent, controlled execution, and risk-aware release—aligned to desk policy before capital is committed.',
  alternates: { canonical: '/trade-engine' },
};

export default function TradeEnginePage() {
  return <TradeEngine />;
}

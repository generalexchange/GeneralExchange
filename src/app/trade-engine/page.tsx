import { TradeEngine } from '@/screens/TradeEngine';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Trade Engine',
  description:
    'Route orders through Interactive Brokers from the same terminal where strategies are researched and validated. Live quotes, wallet context, pre-trade checks, and audit-ready execution.',
  path: '/trade-engine',
  keywords: [
    'Interactive Brokers integration',
    'trade execution software',
    'institutional order routing',
    'options execution terminal',
    'pre-trade risk checks',
  ],
});

export default function TradeEnginePage() {
  return <TradeEngine />;
}

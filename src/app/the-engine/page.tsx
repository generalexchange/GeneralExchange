import { TradeEngine } from '@/screens/TradeEngine';
import { buildPageMetadata } from '@/lib/seo';

/** Legacy URL — same Trade Engine explanation page as /tradeengine. */
export const metadata = buildPageMetadata({
  title: 'Trade Engine',
  description:
    'How General Exchange uses Monte Carlo simulation to turn trading edge into win rate, risk parameters, and expected return.',
  path: '/tradeengine',
});

export default function TheEnginePage() {
  return <TradeEngine />;
}

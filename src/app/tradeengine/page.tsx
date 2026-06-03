import { TradeEngine } from '@/screens/TradeEngine';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'TradeEngine',
  description:
    'How General Exchange uses Monte Carlo simulation to turn trading edge into win rate, risk parameters, and expected return — illustrated with live win-rate simulation, path fans, and options-chain modeling.',
  path: '/tradeengine',
  keywords: [
    'Monte Carlo trading',
    'trade engine',
    'options expected return',
    'win rate simulation',
    'quantitative risk parameters',
    'General Exchange analytics',
  ],
});

export default function TradeEnginePage() {
  return <TradeEngine />;
}

import { Warehouse } from '@/screens/Warehouse';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Data Warehouse — Market Intelligence & Win Rate Analytics',
  description:
    'The General Exchange warehouse ingests tick data, options surfaces, and flow signals into governed snapshots. Win rate, game-theory states, and Monte Carlo risk parameters — all point-in-time and reproducible.',
  path: '/warehouse',
  keywords: [
    'market data warehouse',
    'trading data pipeline',
    'win rate analytics',
    'Monte Carlo risk parameters',
    'institutional market intelligence',
  ],
});

export default function WarehousePage() {
  return <Warehouse />;
}

import { TownAndCattle } from '@/screens/TownAndCattle';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Town & Cattle — Alternative Commodity Trading',
  description:
    'Trade and hedge beyond equities with commodity workflows built for real execution: energy, metals, agriculture, and basis structures with replayable context and margin-aware controls.',
  path: '/town-and-cattle',
  keywords: [
    'commodity trading platform',
    'agricultural futures trading',
    'energy trading software',
    'alternative commodities',
  ],
});

export default function TownAndCattlePage() {
  return <TownAndCattle />;
}

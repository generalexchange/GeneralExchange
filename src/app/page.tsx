import { HomePageJsonLd } from '@/components/seo/JsonLd';
import { Homepage } from '@/screens/Homepage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Institutional Trading Terminal, Backtesting & Execution',
  description:
    'Buy, sell, and exchange with evidence before every decision. General Exchange combines LLM-assisted backtesting, a normalized data warehouse, Interactive Brokers execution, and commodity workflows in one institutional terminal.',
  path: '/',
  keywords: [
    'institutional trading terminal',
    'backtesting software',
    'Interactive Brokers trading platform',
    'options trading terminal',
    'algorithmic trading platform',
    'commodity trading software',
    'General Exchange',
    'Old West Solutions',
  ],
});

export default function HomePage() {
  return (
    <>
      <HomePageJsonLd />
      <Homepage />
    </>
  );
}

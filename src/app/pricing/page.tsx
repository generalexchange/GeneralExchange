import { Pricing } from '@/screens/Pricing';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Purchase General Exchange Tokens',
  description:
    'Buy General Exchange tokens for platform services: research access, Filecoin storage credits, API consumption, and future marketplace features. Solana wallet integration.',
  path: '/pricing',
  keywords: ['General Exchange tokens', 'GEX token', 'Solana wallet', 'Filecoin storage credits', 'platform tokens'],
});

export default function PricingPage() {
  return <Pricing />;
}

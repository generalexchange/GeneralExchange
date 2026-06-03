import { Pricing } from '@/screens/Pricing';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Pricing — Workspace Plans & Compute Tokens',
  description:
    'Transparent General Exchange pricing: institutional workspace entitlements plus tokenized GPU compute billed per hour. Plans for research desks, execution teams, and enterprise deployments.',
  path: '/pricing',
  keywords: ['trading platform pricing', 'institutional trading software cost', 'compute token pricing'],
});

export default function PricingPage() {
  return <Pricing />;
}

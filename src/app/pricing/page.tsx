import type { Metadata } from 'next';
import { Pricing } from '@/screens/Pricing';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'General Exchange pricing: workspace plans for platform entitlements plus tokenized GPU compute billed per hour — transparent two-layer structure.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <Pricing />;
}

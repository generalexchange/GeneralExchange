import type { Metadata } from 'next';
import { Strategies } from '@/screens/Strategies';

export const metadata: Metadata = {
  title: 'Strategies',
  description:
    'Strategy solutions on General Exchange—systematic sleeves, overlays, and versioned narratives for simulation and governance.',
  alternates: { canonical: '/strategies' },
};

export default function StrategiesPage() {
  return <Strategies />;
}

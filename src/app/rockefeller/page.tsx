import type { Metadata } from 'next';
import { Rockefeller } from '@/screens/Rockefeller';

export const metadata: Metadata = {
  title: 'Rockefeller',
  description:
    'Rockefeller on General Exchange—desk-grade briefings on credit, rates, commodities, and flow with provenance-minded layout.',
  alternates: { canonical: '/rockefeller' },
};

export default function RockefellerPage() {
  return <Rockefeller />;
}

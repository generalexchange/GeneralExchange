import type { Metadata } from 'next';
import { Rockefeller } from '@/screens/Rockefeller';

export const metadata: Metadata = {
  title: 'Rockefeller Press',
  description:
    'Rockefeller Press — editorial market intelligence across rates, commodities, credit, and flow for decision-driven desks.',
  alternates: { canonical: '/rockefeller-press' },
};

export default function RockefellerPressPage() {
  return <Rockefeller />;
}


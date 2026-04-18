import type { Metadata } from 'next';
import { Almanac } from '@/screens/Almanac';

export const metadata: Metadata = {
  title: 'Almanac',
  description:
    'Trade history journal for General Exchange—chronological P&L, entries and exits, strategy labels, and session context for simulated outcomes.',
  alternates: { canonical: '/almanac' },
};

export default function AlmanacPage() {
  return <Almanac />;
}

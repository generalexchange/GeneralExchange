import type { Metadata } from 'next';
import { TheEngine } from '@/screens/TheEngine';

export const metadata: Metadata = {
  title: 'Trade Engine',
  description:
    'The evidence layer behind general.exchange — replay any trade against the conditions that actually occurred, and act on the record.',
  alternates: { canonical: '/the-engine' },
};

export default function TheEnginePage() {
  return <TheEngine />;
}

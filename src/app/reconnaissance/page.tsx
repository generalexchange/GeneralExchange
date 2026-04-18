import type { Metadata } from 'next';
import { Reconnaissance } from '@/screens/Reconnaissance';

export const metadata: Metadata = {
  title: 'Reconnaissance',
  description:
    'Pre-trade situational awareness for General Exchange—flow, event windows, and a shared field of view for risk and execution.',
  alternates: { canonical: '/reconnaissance' },
};

export default function ReconnaissancePage() {
  return <Reconnaissance />;
}

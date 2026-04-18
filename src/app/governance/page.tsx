import type { Metadata } from 'next';
import { Governance } from '@/screens/Governance';

export const metadata: Metadata = {
  title: 'Governance',
  description:
    'Manifest-bound lineage, deterministic reproducibility, and one evidence geometry for risk, research, and audit—from signal generation through execution.',
  alternates: { canonical: '/governance' },
};

export default function GovernancePage() {
  return <Governance />;
}

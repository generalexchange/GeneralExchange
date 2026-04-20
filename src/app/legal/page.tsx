import type { Metadata } from 'next';
import { Legal } from '@/screens/Legal';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal disclosures, cookies, and links for General Exchange.',
  alternates: { canonical: '/legal' },
};

export default function LegalPage() {
  return <Legal />;
}

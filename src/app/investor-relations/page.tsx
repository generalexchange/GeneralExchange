import type { Metadata } from 'next';
import { InvestorRelations } from '@/screens/InvestorRelations';

export const metadata: Metadata = {
  title: 'Investor relations',
  description: 'Investor materials, governance highlights, and contact channels for General Exchange.',
  alternates: { canonical: '/investor-relations' },
};

export default function InvestorRelationsPage() {
  return <InvestorRelations />;
}

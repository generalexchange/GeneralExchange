import type { Metadata } from 'next';
import { CompanyHub } from '@/screens/CompanyHub';

export const metadata: Metadata = {
  title: 'Company',
  description: 'General Exchange company hub—mission, team, and institutional partnerships.',
  alternates: { canonical: '/company' },
};

export default function CompanyPage() {
  return <CompanyHub />;
}

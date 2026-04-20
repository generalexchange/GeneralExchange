import type { Metadata } from 'next';
import { SolutionsHub } from '@/screens/SolutionsHub';

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Futures, options, strategies, sentiment, and tokenomics on General Exchange—solution areas with evidence-bound simulation, risk, and infrastructure.',
  alternates: { canonical: '/solutions' },
};

export default function SolutionsPage() {
  return <SolutionsHub />;
}

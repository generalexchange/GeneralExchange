import type { Metadata } from 'next';
import { SolutionsHub } from '@/screens/SolutionsHub';

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Institutional solutions for oil and gas, crop futures, and fixed income—vertical workflows on General Exchange with evidence-bound risk and simulation.',
  alternates: { canonical: '/solutions' },
};

export default function SolutionsPage() {
  return <SolutionsHub />;
}

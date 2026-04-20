import type { Metadata } from 'next';
import { DividendProperties } from '@/screens/DividendProperties';

export const metadata: Metadata = {
  title: 'Dividend Properties',
  description:
    'Dividend Properties on General Exchange—simulation-first templates and education for income-oriented cash flows and paper workflows.',
  alternates: { canonical: '/dividend-properties' },
};

export default function DividendPropertiesPage() {
  return <DividendProperties />;
}

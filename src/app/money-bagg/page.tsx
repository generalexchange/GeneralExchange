import type { Metadata } from 'next';
import { MoneyBagg } from '@/screens/MoneyBagg';

export const metadata: Metadata = {
  title: 'MoneyBagg',
  description:
    'MoneyBagg on General Exchange—allocation snapshots, cash-pile scenarios, and paper treasury workflows with replayable evidence.',
  alternates: { canonical: '/money-bagg' },
};

export default function MoneyBaggPage() {
  return <MoneyBagg />;
}

import type { Metadata } from 'next';
import { BridgeObserver } from '@/screens/BridgeObserver';

export const metadata: Metadata = {
  title: 'Bridge Observer',
  description:
    'Insights, trending signals, and digest content for desks running tokenized compute and institutional workflows.',
  alternates: { canonical: '/bridge-observer' },
};

export default function BridgeObserverPage() {
  return <BridgeObserver />;
}

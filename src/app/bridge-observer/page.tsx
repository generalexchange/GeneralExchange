import type { Metadata } from 'next';
import { Rockefeller } from '@/screens/Rockefeller';

export const metadata: Metadata = {
  title: 'Bridge Observer',
  description:
    'Bridge Observer — the market newspaper for desk operators: session narrative, flow context, and execution-relevant intelligence.',
  alternates: { canonical: '/bridge-observer' },
};

export default function BridgeObserverPage() {
  return <Rockefeller />;
}


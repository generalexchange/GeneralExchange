import type { Metadata } from 'next';
import { Sentiment } from '@/screens/Sentiment';

export const metadata: Metadata = {
  title: 'Sentiment',
  description:
    'Sentiment solutions on General Exchange—structured narrative and positioning features with provenance for risk and simulation.',
  alternates: { canonical: '/sentiment' },
};

export default function SentimentPage() {
  return <Sentiment />;
}

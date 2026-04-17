import type { Metadata } from 'next';
import { Backspace } from '@/screens/Backspace';

export const metadata: Metadata = {
  title: 'Backspace',
  description:
    'Compute-driven backtesting and model research: parallel grids, genetic optimizers, RL lab, latency-aware replay, and correlation exploration on tokenized GPU pools.',
  alternates: { canonical: '/backspace' },
};

export default function BackspacePage() {
  return <Backspace />;
}

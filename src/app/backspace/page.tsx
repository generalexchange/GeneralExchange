import type { Metadata } from 'next';
import { Backspace } from '@/screens/Backspace';

export const metadata: Metadata = {
  title: 'Backspace',
  description:
    'Compute-driven backtesting and model research with a plain-English LLM decision assistant: parallel grids, optimizers, replay, and environment diagnostics.',
  alternates: { canonical: '/backspace' },
};

export default function BackspacePage() {
  return <Backspace />;
}

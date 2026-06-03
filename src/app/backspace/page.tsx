import type { Metadata } from 'next';
import { Backspace } from '@/screens/Backspace';

export const metadata: Metadata = {
  title: 'BackSpace',
  description:
    'BackSpace showcase: LLM-first backtesting interpretation, deterministic replay foundations, and dashboard-aligned decision support.',
  alternates: { canonical: '/backspace' },
};

export default function BackspacePage() {
  return <Backspace />;
}

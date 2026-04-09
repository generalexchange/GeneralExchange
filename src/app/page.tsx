import type { Metadata } from 'next';
import { Homepage } from '@/screens/Homepage';

export const metadata: Metadata = {
  title: 'General Exchange — Institutional Risk, Research, and Execution',
  description:
    'Institutional-grade risk, research, and execution on tokenized compute. Lubbock.Cloud integration and AMD-optimized workloads.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <Homepage />;
}

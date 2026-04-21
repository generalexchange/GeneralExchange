import type { Metadata } from 'next';
import { Assembly } from '@/screens/Assembly';

export const metadata: Metadata = {
  title: 'Assembly',
  description:
    'University Assembly on General Exchange—deep dives, office hours, and replayable sessions on risk, simulation, and platform mechanics.',
  alternates: { canonical: '/assembly' },
};

export default function AssemblyPage() {
  return <Assembly />;
}

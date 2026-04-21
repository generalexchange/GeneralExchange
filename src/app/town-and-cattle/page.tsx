import type { Metadata } from 'next';
import { TownAndCattle } from '@/screens/TownAndCattle';

export const metadata: Metadata = {
  title: 'Town & Cattle',
  description:
    'Town & Cattle on General Exchange—livestock, grains, and basis risk with replayable agricultural futures simulation.',
  alternates: { canonical: '/town-and-cattle' },
};

export default function TownAndCattlePage() {
  return <TownAndCattle />;
}

import type { Metadata } from 'next';
import { OurTeam } from '@/screens/OurTeam';

export const metadata: Metadata = {
  title: 'Our team',
  description: 'Leadership and team behind General Exchange.',
  alternates: { canonical: '/our-team' },
};

export default function OurTeamPage() {
  return <OurTeam />;
}

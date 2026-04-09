import type { Metadata } from 'next';
import { Community } from '@/screens/Community';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Community hub for General Exchange members—discussions, events, and highlights.',
  alternates: { canonical: '/community' },
};

export default function CommunityPage() {
  return <Community />;
}

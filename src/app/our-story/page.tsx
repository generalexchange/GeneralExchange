import type { Metadata } from 'next';
import { OurStory } from '@/screens/OurStory';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'How General Exchange builds simulation-first markets—paper workflows, Monte Carlo, and tokenized compute from Fort Worth.',
  alternates: { canonical: '/our-story' },
};

export default function OurStoryPage() {
  return <OurStory />;
}

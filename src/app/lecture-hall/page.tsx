import type { Metadata } from 'next';
import { LectureHall } from '@/screens/LectureHall';

export const metadata: Metadata = {
  title: 'Lecture Hall',
  description:
    'University Lecture Hall on General Exchange—deep dives, office hours, and replayable sessions on risk, simulation, and platform mechanics.',
  alternates: { canonical: '/lecture-hall' },
};

export default function LectureHallPage() {
  return <LectureHall />;
}

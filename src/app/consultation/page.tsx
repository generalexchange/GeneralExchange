import type { Metadata } from 'next';
import { Consultation } from '@/screens/Consultation';

export const metadata: Metadata = {
  title: 'Consultation',
  description:
    'Consultation for General Exchange—desk-aligned scoping for simulation, governance, and platform workflows before production.',
  alternates: { canonical: '/consultation' },
};

export default function ConsultationPage() {
  return <Consultation />;
}

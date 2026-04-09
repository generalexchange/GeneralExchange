import type { Metadata } from 'next';
import { University } from '@/screens/University';

export const metadata: Metadata = {
  title: 'University',
  description:
    'Structured lessons on options, risk, and the General Exchange workflow—from fundamentals to advanced desk practice.',
  alternates: { canonical: '/university' },
};

export default function UniversityPage() {
  return <University />;
}

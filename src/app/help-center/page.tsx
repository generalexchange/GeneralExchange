import type { Metadata } from 'next';
import { HelpCenter } from '@/screens/HelpCenter';

export const metadata: Metadata = {
  title: 'Help center',
  description: 'Support, FAQs, and contact options for General Exchange.',
  alternates: { canonical: '/help-center' },
};

export default function HelpCenterPage() {
  return <HelpCenter />;
}

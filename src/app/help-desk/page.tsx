import type { Metadata } from 'next';
import { HelpDesk } from '@/screens/HelpDesk';

export const metadata: Metadata = {
  title: 'Help Desk',
  description:
    'Help desk for General Exchange—product questions, access issues, and routing to the help center and request access.',
  alternates: { canonical: '/help-desk' },
};

export default function HelpDeskPage() {
  return <HelpDesk />;
}

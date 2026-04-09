import type { Metadata } from 'next';
import { RequestAccess } from '@/screens/RequestAccess';

export const metadata: Metadata = {
  title: 'Request platform access',
  description:
    "Request access to General Exchange's professional platform. Connect with our team for AI-powered risk and execution tools.",
  alternates: { canonical: '/request-access' },
};

export default function RequestAccessPage() {
  return <RequestAccess />;
}

import type { Metadata } from 'next';
import { Documents } from '@/screens/Documents';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Corporate documents, policies, and compliance reference for General Exchange.',
  alternates: { canonical: '/documents' },
};

export default function DocumentsPage() {
  return <Documents />;
}

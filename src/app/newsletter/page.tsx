import type { Metadata } from 'next';
import { Newsletter } from '@/screens/Newsletter';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Subscribe to General Exchange for product updates, platform notes, and curated market context.',
  alternates: { canonical: '/newsletter' },
};

export default function NewsletterPage() {
  return <Newsletter />;
}

import type { Metadata } from 'next';
import { PrivacyPolicy } from '@/screens/PrivacyPolicy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for the General Exchange marketing site—data practices and your choices.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}

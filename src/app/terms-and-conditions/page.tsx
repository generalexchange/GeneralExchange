import type { Metadata } from 'next';
import { TermsAndConditions } from '@/screens/TermsAndConditions';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and conditions for using the General Exchange marketing site and related services.',
  alternates: { canonical: '/terms-and-conditions' },
};

export default function TermsAndConditionsPage() {
  return <TermsAndConditions />;
}

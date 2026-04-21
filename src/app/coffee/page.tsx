import type { Metadata } from 'next';
import { Coffee } from '@/screens/Coffee';

export const metadata: Metadata = {
  title: 'Coffee',
  description:
    'Coffee on General Exchange—credit.coffee, a credit-markets newsletter for new issues, spreads, and covenant context without the noise.',
  alternates: { canonical: '/coffee' },
};

export default function CoffeePage() {
  return <Coffee />;
}

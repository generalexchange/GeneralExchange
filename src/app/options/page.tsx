import type { Metadata } from 'next';
import { Options as OptionsSolution } from '@/screens/Options';

export const metadata: Metadata = {
  title: 'Options',
  description:
    'Options solutions on General Exchange—surfaces, greeks, and scenario grids with explainable model and calendar lineage.',
  alternates: { canonical: '/options' },
};

export default function OptionsPage() {
  return <OptionsSolution />;
}

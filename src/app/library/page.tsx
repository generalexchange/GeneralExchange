import type { Metadata } from 'next';
import { Library } from '@/screens/Library';

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Quant research environment: notebooks, data lake access, strategy marketplace, and model sandboxes tied to compute tokens.',
  alternates: { canonical: '/library' },
};

export default function LibraryPage() {
  return <Library />;
}

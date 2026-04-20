import type { Metadata } from 'next';
import { OilAndGas } from '@/screens/OilAndGas';

export const metadata: Metadata = {
  title: 'Oil & Gas',
  description:
    'Hydrocarbon risk on General Exchange—curve structure, inventory, and GPU-backed scenarios with lineage you can cite.',
  alternates: { canonical: '/oil-and-gas' },
};

export default function OilAndGasPage() {
  return <OilAndGas />;
}

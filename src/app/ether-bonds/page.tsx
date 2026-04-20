import type { Metadata } from 'next';
import { EtherBonds } from '@/screens/EtherBonds';

export const metadata: Metadata = {
  title: 'Ether Bonds',
  description:
    'Ether Bonds on General Exchange—on-chain credit and yield narratives with desk-grade simulation discipline and tokenomics alignment.',
  alternates: { canonical: '/ether-bonds' },
};

export default function EtherBondsPage() {
  return <EtherBonds />;
}

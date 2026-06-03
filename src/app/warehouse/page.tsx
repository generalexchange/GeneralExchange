import type { Metadata } from 'next';
import { Warehouse } from '@/screens/Warehouse';

export const metadata: Metadata = {
  title: 'Warehouse',
  description:
    'Warehouse system documentation: deterministic market-data ingestion, canonical standardization, game-theory interpretation, and structured analytical outputs.',
  alternates: { canonical: '/warehouse' },
};

export default function WarehousePage() {
  return <Warehouse />;
}

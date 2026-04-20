import type { Metadata } from 'next';
import { CropFutures } from '@/screens/CropFutures';

export const metadata: Metadata = {
  title: 'Crop Futures',
  description:
    'Agricultural futures solutions—seasonality, basis, and weather volatility with deterministic scenarios you can replay and audit.',
  alternates: { canonical: '/crop-futures' },
};

export default function CropFuturesPage() {
  return <CropFutures />;
}

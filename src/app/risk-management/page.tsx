import type { Metadata } from 'next';
import { RiskManagement } from '@/screens/RiskManagement';

export const metadata: Metadata = {
  title: 'Risk management',
  description:
    'Risk in trading tools and compute tokens—scenario engines, pre-trade gates, and governed accelerator capacity.',
  alternates: { canonical: '/risk-management' },
};

export default function RiskManagementPage() {
  return <RiskManagement />;
}

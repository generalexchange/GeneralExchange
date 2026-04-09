import type { Metadata } from 'next';
import { Dashboard } from '@/screens/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Institutional dashboard for risk, research, models, and execution on General Exchange.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}

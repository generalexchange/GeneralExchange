import type { Metadata } from 'next';
import { Login } from '@/screens/Login';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to General Exchange for institutional trading, research, and risk tools.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return <Login />;
}

import { Login } from '@/screens/Login';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Sign In',
  description: 'Sign in to your General Exchange workspace for institutional trading, research, and risk tools.',
  path: '/login',
  noIndex: true,
});

export default function LoginPage() {
  return <Login />;
}

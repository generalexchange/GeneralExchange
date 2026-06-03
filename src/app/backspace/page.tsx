import { Backspace } from '@/screens/Backspace';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'BackSpace — LLM-Assisted Backtesting & Strategy Research',
  description:
    'Graduate-level backtesting with path-dependent simulations, regime segmentation, and a plain-English LLM research assistant that explains why strategies hold up or fail before capital goes live.',
  path: '/backspace',
  keywords: [
    'backtesting platform',
    'LLM strategy research',
    'regime-aware backtesting',
    'deterministic trade replay',
    'quantitative strategy testing',
  ],
});

export default function BackspacePage() {
  return <Backspace />;
}

import type { Metadata } from 'next';
import { CompanyDetails } from '@/screens/CompanyDetails';

type Props = {
  params: Promise<{ symbol: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const upper = symbol?.toUpperCase?.() ?? symbol;
  return {
    title: `${upper} — Company profile`,
    description: `Institutional profile, context, and tools for ${upper} on General Exchange.`,
    alternates: { canonical: `/company/${encodeURIComponent(symbol)}` },
  };
}

export default function CompanySymbolPage() {
  return <CompanyDetails />;
}

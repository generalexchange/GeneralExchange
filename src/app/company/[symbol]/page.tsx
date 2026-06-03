import type { Metadata } from 'next';
import { CompanyDetails } from '@/screens/CompanyDetails';
import { MOCK_STOCKS_BY_KEY } from '@/data/mockStocksCatalog';

type Props = {
  params: Promise<{ symbol: string }>;
};

// Pre-render the known symbol universe so company profiles are available in the
// static desktop bundle (which has no server to render arbitrary params on
// demand). On the web build these are simply prebuilt; other symbols still
// render dynamically there.
export function generateStaticParams(): { symbol: string }[] {
  return Object.keys(MOCK_STOCKS_BY_KEY).map((symbol) => ({ symbol }));
}

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

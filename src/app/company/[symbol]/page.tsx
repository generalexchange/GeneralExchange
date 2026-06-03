import { CompanyDetails } from '@/screens/CompanyDetails';
import { MOCK_STOCKS_BY_KEY } from '@/data/mockStocksCatalog';
import { buildPageMetadata } from '@/lib/seo';

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

export async function generateMetadata({ params }: Props) {
  const { symbol } = await params;
  const upper = symbol?.toUpperCase?.() ?? symbol;
  const stock = MOCK_STOCKS_BY_KEY[upper];
  const companyName = stock?.name ?? upper;

  return buildPageMetadata({
    title: `${upper} Stock Profile — ${companyName}`,
    description: `Institutional company profile, market context, and research tools for ${companyName} (${upper}) on General Exchange.`,
    path: `/company/${encodeURIComponent(symbol)}`,
    keywords: [`${upper} stock`, `${companyName} analysis`, 'company profile trading'],
  });
}

export default function CompanySymbolPage() {
  return <CompanyDetails />;
}

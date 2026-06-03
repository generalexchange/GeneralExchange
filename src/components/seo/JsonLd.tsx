import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_PUBLISHER, SITE_URL } from '@/lib/seo';

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function HomePageJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_PUBLISHER,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    sameAs: ['https://github.com/generalexchange/GeneralExchange'],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { '@type': 'Organization', name: SITE_PUBLISHER },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/company?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Windows, macOS, Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Request access for institutional workspace pricing',
    },
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    downloadUrl: `${SITE_URL}/download`,
    publisher: { '@type': 'Organization', name: SITE_PUBLISHER },
  };

  return <JsonLd data={[organization, website, software]} />;
}

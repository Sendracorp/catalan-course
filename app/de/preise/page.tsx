import type { Metadata } from 'next';
import LocalizedPricing from '@/components/marketing/LocalizedPricing';
import { getDict, hreflang, PATHS } from '@/lib/i18n';
const d = getDict('de');

export const metadata: Metadata = {
  title: `${d.pricing.title} — Verbadium`,
  description: d.pricing.sub,
  alternates: { canonical: PATHS.pricing.de, languages: hreflang('pricing') },
  openGraph: { title: `${d.pricing.title} — Verbadium`, description: d.pricing.sub, url: PATHS.pricing.de, locale: 'de_DE' },
};

export default function Page() { return <LocalizedPricing lang="de" />; }

import type { Metadata } from 'next';
import LocalizedPricing from '@/components/marketing/LocalizedPricing';
import { getDict, hreflang, PATHS } from '@/lib/i18n';
const d = getDict('es');

export const metadata: Metadata = {
  title: `${d.pricing.title} — Verbadium`,
  description: d.pricing.sub,
  alternates: { canonical: PATHS.pricing.es, languages: hreflang('pricing') },
  openGraph: { title: `${d.pricing.title} — Verbadium`, description: d.pricing.sub, url: PATHS.pricing.es, locale: 'es_ES' },
};

export default function Page() { return <LocalizedPricing lang="es" />; }

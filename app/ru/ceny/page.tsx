import type { Metadata } from 'next';
import LocalizedPricing from '@/components/marketing/LocalizedPricing';
import { getDict, hreflang, PATHS } from '@/lib/i18n';
const d = getDict('ru');

export const metadata: Metadata = {
  title: `${d.pricing.title} — Verbadium`,
  description: d.pricing.sub,
  alternates: { canonical: PATHS.pricing.ru, languages: hreflang('pricing') },
  openGraph: { title: `${d.pricing.title} — Verbadium`, description: d.pricing.sub, url: PATHS.pricing.ru, locale: 'ru_RU' },
};

export default function Page() { return <LocalizedPricing lang="ru" />; }

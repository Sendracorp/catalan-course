import type { Metadata } from 'next';
import LocalizedPricing from '@/components/marketing/LocalizedPricing';
import { getDict, localizedMeta } from '@/lib/i18n';
const d = getDict('de');

export const metadata: Metadata = localizedMeta('de', 'pricing', d.pricing.title, d.pricing.sub);

export default function Page() { return <LocalizedPricing lang="de" />; }

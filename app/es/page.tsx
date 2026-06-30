import type { Metadata } from 'next';
import LocalizedHome from '@/components/marketing/LocalizedHome';
import { getDict, localizedMeta } from '@/lib/i18n';
const d = getDict('es');

export const metadata: Metadata = localizedMeta('es', 'home', d.home.h1, d.course.metaDesc);

export default function Page() { return <LocalizedHome lang="es" />; }

import type { Metadata } from 'next';
import LocalizedHome from '@/components/marketing/LocalizedHome';
import { getDict, localizedMeta } from '@/lib/i18n';
const d = getDict('ru');

export const metadata: Metadata = localizedMeta('ru', 'home', d.home.h1, d.course.metaDesc);

export default function Page() { return <LocalizedHome lang="ru" />; }

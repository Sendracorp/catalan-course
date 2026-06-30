import type { Metadata } from 'next';
import LocalizedCourse from '@/components/marketing/LocalizedCourse';
import { getDict, localizedMeta } from '@/lib/i18n';
const d = getDict('fr');

export const metadata: Metadata = localizedMeta('fr', 'course', d.course.metaTitle, d.course.metaDesc);

export default function Page() { return <LocalizedCourse lang="fr" />; }

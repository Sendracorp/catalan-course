import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedCourse from '@/components/marketing/LocalizedCourse';
import { getCourseMeta } from '@/lib/courses';
import { getDict, courseCopy, localizedMeta } from '@/lib/i18n';
const d = getDict('de');
const cc = courseCopy(d, 'catalan-a2');

export const metadata: Metadata = localizedMeta('de', 'courseA2', cc.metaTitle, cc.metaDesc);

// 404 until the A2 course is available (launch step); then this is its de landing.
export default function Page() {
  if (!getCourseMeta('catalan-a2')) notFound();
  return <LocalizedCourse lang="de" family="catalan-a2" />;
}

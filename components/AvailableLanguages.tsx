import Link from 'next/link';
import { LOCALE_LABEL, PATHS, type Locale } from '@/lib/i18n';

/* "Available in: English · Español · …" — shows the teaching languages a course
   can be bought in, each linking to that language's pricing page (a whole-page
   switch, so we never mix languages on one page). Language names use endonyms
   (each in its own language), which is conventional for a language picker. */
export default function AvailableLanguages({ mediums, label }: { mediums: Locale[]; label: string }) {
  if (mediums.length < 2) return null;
  const pricing = PATHS.pricing as Record<string, string>;
  return (
    <p className="course-langs">
      <span className="course-langs-label">{label}:</span>{' '}
      {mediums.map((m, i) => (
        <span key={m}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <Link href={pricing[m]} hrefLang={m}>{LOCALE_LABEL[m]}</Link>
        </span>
      ))}
    </p>
  );
}

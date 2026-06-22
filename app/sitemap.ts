import type { MetadataRoute } from 'next';
import { COURSES } from '@/lib/courses';
import { PATHS, LOCALES } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verbadium.com';

/* Only public, indexable pages. Gated units/mock/glossary show a paywall
   (thin/duplicate), so they're left out; auth/admin/account are disallowed
   in robots. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/refunds`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ];
  for (const c of COURSES.filter(c => c.available)) {
    const b = `${SITE_URL}/courses/${c.slug}`;
    entries.push(
      { url: b, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${b}/ipa`, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${b}/exam`, changeFrequency: 'monthly', priority: 0.6 },
    );
    for (const u of c.freeUnits) entries.push({ url: `${b}/unit/${u}`, changeFrequency: 'monthly', priority: 0.7 });
  }
  // localized marketing landing pages (ca/es/fr/ru) — skip mediums with no route (de)
  const home = PATHS.home as Record<string, string | undefined>;
  const course = PATHS.course as Record<string, string | undefined>;
  for (const l of LOCALES) {
    if (l === 'en' || !home[l] || !course[l]) continue;
    entries.push(
      { url: `${SITE_URL}${home[l]}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}${course[l]}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    );
  }
  return entries;
}

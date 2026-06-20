import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { Course } from './types';
import type { Locale } from './i18n';
import { getCourse } from './course';
import { localizeCourse } from './i18n-course';

function baseCourse(slug: string): Course | null {
  if (slug === 'catalan-a1') return getCourse();
  return null;
}

function loadDict(slug: string, medium: Locale): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'i18n', `${slug}.${medium}.json`), 'utf8'));
  } catch { return {}; }   // no translation file yet → English fallback
}

const localized = new Map<string, Course | null>();

/* Maps a catalog slug to its parsed content, in a teaching medium.
   English is the source — returned untouched. Other mediums apply the
   translation overlay (LOCALIZATION.md §3); missing keys fall back to English. */
export function getCourseContent(slug: string, medium: Locale = 'en'): Course | null {
  if (medium === 'en') return baseCourse(slug);
  const key = `${slug}:${medium}`;
  if (localized.has(key)) return localized.get(key)!;
  const base = baseCourse(slug);
  const out = base ? localizeCourse(base, loadDict(slug, medium)) : null;
  localized.set(key, out);
  return out;
}

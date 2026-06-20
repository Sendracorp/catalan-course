import type { Course, Exercise, MockData, TFItem, ListenItem } from './types';

/* Course content i18n engine (see LOCALIZATION.md §3).
   Separates the translatable TEACHING strings (prose, instructions, glosses,
   English answers) from the language-neutral Catalan SPINE (Catalan text, IPA,
   exercise structure + answers, audio keys), via stable keys.

   - extractCatalog(course)            → { key: English string }  (translator source)
   - localizeCourse(course, dict)      → a Course with translatable strings swapped
                                         for the medium's values; missing keys fall
                                         back to the original English (lossless).

   English rendering never calls this (getCourseContent('…','en') returns the base
   course untouched), so it can't change current behaviour. */

interface Field { key: string; get: () => string; set: (v: string) => void }

// item html that is teaching content (Catalan-with-English-hints / prompts), not pure spine
const TRANSLATE_HTML = new Set<Exercise['type']>(['gap', 'write', 'model', 'free', 'personal']);

function collect(course: Course): Field[] {
  const f: Field[] = [];
  const co = course as unknown as Record<string, unknown>;
  const s = (key: string, o: Record<string, unknown>, p: string) => {
    if (typeof o[p] === 'string' && o[p]) f.push({ key, get: () => o[p] as string, set: v => { o[p] = v; } });
  };

  // course-level prose
  s('intro', co, 'introHtml');
  s('ipaGuide', co, 'ipaGuideHtml');
  s('ipaCheat', co, 'ipaCheatHtml');
  s('examInfo', co, 'examInfoHtml');
  s('checklistFoot', co, 'checklistFootHtml');
  s('cite', co, 'citeHtml');
  course.checklist.forEach((_, i) =>
    f.push({ key: `checklist.${i}`, get: () => course.checklist[i], set: v => { course.checklist[i] = v; } }));

  // glossary: only the English meaning column (ca/IPA/unit are spine)
  course.glossary.forEach(row =>
    f.push({ key: `gloss.${row.unit}.${row.ca}`, get: () => row.en, set: v => { row.en = v; } }));

  // units
  for (const u of course.units) {
    f.push({ key: `u${u.num}.title`, get: () => u.title, set: v => { u.title = v; } });
    u.blocks.forEach((b, i) => {
      if (b.kind === 'html') f.push({ key: `u${u.num}.block.${i}`, get: () => b.html, set: v => { b.html = v; } });
      else collectExercise(b.ex, f);
    });
  }

  collectMock(course.mock, f);
  return f;
}

function collectExercise(ex: Exercise, f: Field[]): void {
  const id = ex.id;
  if (ex.title) f.push({ key: `ex.${id}.title`, get: () => ex.title, set: v => { ex.title = v; } });
  if (ex.noteHtml) f.push({ key: `ex.${id}.note`, get: () => ex.noteHtml, set: v => { ex.noteHtml = v; } });
  // keyHtml is only RENDERED for these (model-answer reveal); elsewhere it's the Catalan answer key (spine)
  if (ex.keyHtml && (ex.type === 'model' || ex.type === 'free' || ex.type === 'personal'))
    f.push({ key: `ex.${id}.key`, get: () => ex.keyHtml, set: v => { ex.keyHtml = v; } });

  ex.items.forEach((it, j) => {
    const item = it as unknown as Record<string, unknown>;
    if (TRANSLATE_HTML.has(ex.type) && typeof item.html === 'string' && item.html)
      f.push({ key: `ex.${id}.i${j}.html`, get: () => item.html as string, set: v => { item.html = v; } });
    if (ex.type === 'tf') {
      const t = it as TFItem;
      if (t.html) f.push({ key: `ex.${id}.i${j}.html`, get: () => t.html, set: v => { t.html = v; } });
      if (t.note) f.push({ key: `ex.${id}.i${j}.note`, get: () => t.note, set: v => { t.note = v; } });
    }
    if (ex.type === 'listen') {                 // English translations; dictation/listenmatch are spine
      const l = it as ListenItem;
      f.push({
        key: `ex.${id}.i${j}.ans`,
        get: () => l.answers.join(' / '),
        set: v => { l.answers = v.split(' / ').map(x => x.trim()).filter(Boolean); },
      });
    }
  });
}

function collectMock(m: MockData, f: Field[]): void {
  // English/explanatory parts of the mock; the Catalan `script`, the matching
  // pairs and the listening true/false values are spine (left untouched).
  for (const p of ['introNote', 'p2notice', 'p2aKeyHtml', 'p3bTask', 'p3bModel', 'p4role', 'p4mark', 'p4model', 'p4roleModel'] as const) {
    const o = m as unknown as Record<string, unknown>;
    if (typeof o[p] === 'string' && o[p]) f.push({ key: `mock.${p}`, get: () => o[p] as string, set: v => { o[p] = v; } });
  }
  m.p1items.forEach((_, i) => f.push({ key: `mock.p1.${i}`, get: () => m.p1items[i], set: v => { m.p1items[i] = v; } }));
  m.p4qs.forEach((_, i) => f.push({ key: `mock.p4q.${i}`, get: () => m.p4qs[i], set: v => { m.p4qs[i] = v; } }));
  m.p1answers.forEach((a, i) => { if (a.note) f.push({ key: `mock.p1note.${i}`, get: () => a.note, set: v => { a.note = v; } }); });
}

export function extractCatalog(course: Course): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of collect(course)) out[field.key] = field.get();
  return out;
}

export function localizeCourse(course: Course, dict: Record<string, string>): Course {
  const clone: Course = structuredClone(course);
  for (const field of collect(clone)) {
    const v = dict[field.key];
    if (typeof v === 'string' && v.length) field.set(v);
  }
  return clone;
}

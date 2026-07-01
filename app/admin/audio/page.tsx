import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AudioManager from '@/components/admin/AudioManager';
import { getServerSupabase, getSessionUser } from '@/lib/supabase/server';
import { getCourseContent } from '@/lib/content';
import { COURSES } from '@/lib/courses';
import { nativeKey } from '@/lib/native-audio-key';
import nativeAudio from '@/lib/native-audio.json';
import ttsAudio from '@/lib/tts-audio.json';
import { listAudioOverrides } from '@/lib/audio-overrides';

export const metadata: Metadata = { title: 'Audio' };
export const dynamic = 'force-dynamic';

// Audio is keyed by Catalan text and shared across a family's language variants,
// so the English slug (== family) is enough. Not-yet-available courses are
// included so their audio can be prepared before launch.
const FAMILIES = COURSES.filter(c => c.medium === 'en');

export default async function AdminAudioPage({ searchParams }: {
  searchParams: Promise<{ course?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin/audio');
  const supabase = await getServerSupabase();
  const { data: profile } = await supabase!.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) notFound();

  const sp = await searchParams;
  const SLUG = FAMILIES.some(f => f.slug === sp.course) ? sp.course! : FAMILIES[0].slug;

  const course = getCourseContent(SLUG);
  if (!course) notFound();

  const overrides = await listAudioOverrides(SLUG);
  const overrideKeys = new Set(overrides.map(o => o.text_key));
  const nat = nativeAudio.entries as Record<string, string[]>;
  const tts = ttsAudio.entries as Record<string, string[]>;

  const seen = new Set<string>();
  const texts = course.glossary.flatMap(g => {
    const key = nativeKey(g.ca);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    const source = overrideKeys.has(key) ? 'override' : key in nat ? 'native' : key in tts ? 'tts' : 'none';
    return [{ key, label: g.ca, en: g.en, source }];
  });

  return (
    <>
      <SiteHeader />
      <main className="site-main">
        {FAMILIES.length > 1 && (
          <div className="card" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {FAMILIES.map(f => (
              <Link key={f.slug} href={`/admin/audio?course=${f.slug}`}
                className={`btn${f.slug === SLUG ? ' btn-primary' : ''}`}>
                {f.language} {f.level}{f.available ? '' : ' · soon'}
              </Link>
            ))}
          </div>
        )}
        <div className="card">
          <h1>Audio recordings</h1>
          <p className="note">
            Record or upload audio for any course word/phrase. Uploads replace the built-in
            audio (native recording or generated TTS) at runtime — they always win. Files are
            stored in Supabase Storage and served over the CDN.
          </p>
          <AudioManager courseSlug={SLUG} texts={texts} overrides={overrides} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import Link from 'next/link';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import JsonLd from '../JsonLd';
import SetMedium from '../SetMedium';
import BuyButton from '../BuyButton';
import { getDict, courseCopy, t, PATHS, type Locale } from '@/lib/i18n';
import { getCourseMeta, variantForMedium } from '@/lib/courses';
import { buyLabels } from '@/lib/ui';
import { SITE } from '@/lib/site';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verbadium.com';

/* Localized course landing (sales page). Sells the variant taught in this
   language (es/fr/ru/de); locales with no teaching variant (ca) funnel to the
   English course. Uses the fixed price label (not the live Paddle fetch) so the
   page stays static — the live price is charged at checkout. */
export default function LocalizedCourse({ lang, family = 'catalan-a1' }: { lang: Locale; family?: string }) {
  const d = getDict(lang);
  const cc = courseCopy(d, family);
  const meta = getCourseMeta(family)!;
  // The course variant this page sells (its own language, else English).
  const variant = variantForMedium(family, lang) ?? meta;
  const base = `/courses/${variant.slug}`;
  const price = meta.priceLabel;
  const preview = `${base}/unit/${meta.freeUnits[0]}`;
  const landingPath = (PATHS[family === 'catalan-a2' ? 'courseA2' : 'course'] as Record<string, string>)[lang];
  const vars = { units: meta.stats.units, exercises: meta.stats.exercises, glossary: meta.stats.glossary, price };

  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: cc.name,
    description: cc.tagline,
    url: `${SITE_URL}${landingPath}`,
    inLanguage: 'ca',
    educationalLevel: `${meta.level} (CEFR)`,
    teaches: `${meta.language} ${meta.level}`,
    coursePrerequisites: 'None — complete beginner',
    isAccessibleForFree: true,
    provider: { '@type': 'EducationalOrganization', name: SITE.brand, url: SITE_URL },
    offers: { '@type': 'Offer', price: '25', priceCurrency: 'EUR', category: 'Paid', availability: 'https://schema.org/InStock', url: `${SITE_URL}/pricing` },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', instructor: { '@type': 'Organization', name: SITE.brand } },
  };

  return (
    <div lang={lang}>
      <SetMedium lang={lang} />
      <JsonLd data={courseLd} />
      <SiteHeader lang={lang} page="course" />
      <main className="site-main">
        <div className="hero">
          <div className="badge">CEFR · {meta.level} · {d.nav.course}</div>
          <h1>{cc.name}</h1>
          <p className="hero-sub">{cc.tagline}</p>
          <p className="hero-meta">{cc.taughtInEnglish}</p>
        </div>
        <div className="card sales">
          <h2>{t(cc.salesHeading, vars)}</h2>
          <ul className="sales-list">
            {cc.bullets.map((b, i) => <li key={i}>{t(b, vars)}</li>)}
          </ul>
          <div className="paywall-actions">
            <BuyButton courseSlug={variant.slug} priceLabel={price} returnTo={base} labels={buyLabels(lang)} />
            <Link className="btn" href={preview}>{d.card.preview}</Link>
          </div>
          <p className="paywall-preview">
            {cc.previewLead} <Link href={preview}>{t(cc.previewLink, { n: meta.freeUnits[0] })}</Link>
          </p>
          <p className="note">{cc.alreadyBought}: <Link href={`/login?next=${encodeURIComponent(preview)}`}>{d.nav.login}</Link></p>
        </div>
      </main>
      <SiteFooter lang={lang} page="course" />
    </div>
  );
}

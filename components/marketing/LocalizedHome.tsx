import Link from 'next/link';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import SetMedium from '../SetMedium';
import { getDict, courseCopy, PATHS, type Locale, type PageKey } from '@/lib/i18n';
import { courseFamilies } from '@/lib/courses';

/* Localized marketing home (catalog) for ca/es/fr/ru/de. One card per sellable
   family (matching the English catalog); each links to its localized course
   landing. Courses are taught in English. */
export default function LocalizedHome({ lang }: { lang: Locale }) {
  const d = getDict(lang);
  const families = courseFamilies();
  return (
    <div lang={lang}>
      <SetMedium lang={lang} />
      <SiteHeader lang={lang} page="home" />
      <main className="site-main">
        <div className="hero">
          <div className="badge">{d.home.badge}</div>
          <h1>{d.home.h1}</h1>
          <p className="hero-sub">{d.home.sub}</p>
        </div>
        <div className="catalog-grid">
          {families.map(({ family, variants }) => {
            const meta = variants[0];
            const cc = courseCopy(d, family);
            const page: PageKey = family === 'catalan-a2' ? 'courseA2' : 'course';
            return (
              <Link key={family} className="card course-card" href={(PATHS[page] as Record<string, string>)[lang]} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="course-card-head"><span className="badge">{cc.subject} · {meta.level}</span></div>
                <h2>{cc.name}</h2>
                <p>{cc.tagline}</p>
                <p className="course-card-price">{meta.priceLabel} <span className="course-card-price-note">· {d.card.lifetime}</span></p>
                <div className="course-card-actions">
                  <span className="btn btn-primary">{d.home.seeCourse}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter lang={lang} page="home" />
    </div>
  );
}

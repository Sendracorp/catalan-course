import Link from 'next/link';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import JsonLd from '../JsonLd';
import SetMedium from '../SetMedium';
import BuyButton from '../BuyButton';
import AvailableLanguages from '../AvailableLanguages';
import { getDict, courseCopy, t, type Locale } from '@/lib/i18n';
import { variantForMedium, courseFamilies } from '@/lib/courses';
import { buyLabels } from '@/lib/ui';

/* Localized pricing page (price + what's included + FAQ), mirroring /pricing.
   One card per sellable family; each sells the variant taught in this language
   (locales with no variant — e.g. ca — funnel to the English course). Static —
   the live price is charged at checkout; this shows the fixed label. */
export default function LocalizedPricing({ lang }: { lang: Locale }) {
  const d = getDict(lang);
  const families = courseFamilies();

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: d.pricing.faq.map(f => ({
      '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div lang={lang}>
      <SetMedium lang={lang} />
      <JsonLd data={faqLd} />
      <SiteHeader lang={lang} page="pricing" />
      <main className="site-main">
        <div className="hero">
          <div className="badge">{d.nav.pricing}</div>
          <h1>{d.pricing.title}</h1>
          <p className="hero-sub">{d.pricing.sub}</p>
        </div>

        <div className="pricing-grid" data-test="pricing">
          {families.map(({ family, variants }) => {
            const meta = variants[0];
            const cc = courseCopy(d, family);
            const variant = variantForMedium(family, lang) ?? meta;
            const base = `/courses/${variant.slug}`;
            const price = meta.priceLabel;
            const preview = `${base}/unit/${meta.freeUnits[0]}`;
            const vars = { units: meta.stats.units, exercises: meta.stats.exercises, glossary: meta.stats.glossary, price };
            return (
              <div key={family} className="card pricing-card" data-test={`pricing-${variant.slug}`}>
                <div className="badge">{cc.subject} · {meta.level}</div>
                <h2>{cc.name}</h2>
                <p className="pricing-amount" data-test="pricing-amount">{price}</p>
                <p className="pricing-amount-note">{d.card.lifetime}</p>
                <ul className="sales-list">
                  {cc.bullets.map((b, i) => <li key={i}>{t(b, vars)}</li>)}
                </ul>
                <div className="paywall-actions">
                  <BuyButton courseSlug={variant.slug} priceLabel={price} returnTo={base} labels={buyLabels(lang)} />
                  <Link className="btn" href={preview}>{d.card.preview}</Link>
                </div>
                <AvailableLanguages mediums={variants.map(v => v.medium)} label={d.card.availableIn} />
              </div>
            );
          })}
        </div>

        <div className="card">
          <h2>{d.pricing.faqHeading}</h2>
          <dl className="faq">
            {d.pricing.faq.map((f, i) => (
              <div key={i} className="faq-item">
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
      <SiteFooter lang={lang} page="pricing" />
    </div>
  );
}

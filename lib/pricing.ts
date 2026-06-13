import 'server-only';
import { getCourseMeta, type CourseMeta } from './courses';
import { getPaddlePrice } from './paddle';
import { formatMoney } from './money';

/* Single source of truth for the price shown anywhere on the site. Prefers the
   live Paddle price (so the displayed amount provably equals the charged one);
   falls back to the catalog's priceLabel when Paddle isn't configured yet. */

export interface ResolvedPrice {
  label: string;                       // e.g. "€70"
  source: 'paddle' | 'fallback';
  amountMinor?: number;
  currency?: string;
}

export async function resolveCoursePrice(slug: string): Promise<ResolvedPrice> {
  const meta = getCourseMeta(slug);
  const live = await getPaddlePrice(slug);
  if (live) {
    return {
      label: formatMoney(live.amountMinor, live.currency),
      source: 'paddle',
      amountMinor: live.amountMinor,
      currency: live.currency,
    };
  }
  return { label: meta?.priceLabel ?? '', source: 'fallback' };
}

export interface PricedCourse { meta: CourseMeta; price: ResolvedPrice }

export async function resolveAllPrices(courses: CourseMeta[]): Promise<PricedCourse[]> {
  return Promise.all(courses.map(async meta => ({ meta, price: await resolveCoursePrice(meta.slug) })));
}

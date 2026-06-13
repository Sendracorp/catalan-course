import Link from 'next/link';
import BuyButton from './BuyButton';
import type { CourseMeta } from '@/lib/courses';
import { resolveCoursePrice } from '@/lib/pricing';

/* Server lock screen shown in place of gated content. Resolves the live
   Paddle price itself, so every paywall shows the real, current amount. */
export default async function Paywall({ meta, what, loggedIn, returnTo }: {
  meta: CourseMeta;
  what: string;                 // e.g. "Unit 4" / "the mock exam" / "the glossary"
  loggedIn: boolean;
  returnTo: string;
}) {
  const previewUnit = meta.freeUnits[0];
  const { label: price } = await resolveCoursePrice(meta.slug);
  return (
    <div className="card paywall" data-test="paywall">
      <div className="badge">LOCKED</div>
      <h2>{what} is part of the full course</h2>
      <p>
        <b>{meta.title}</b> — {meta.description}
      </p>
      <p>
        One payment of <b>{price}</b> unlocks everything, forever: all {meta.stats.units} units,
        the mock exam with timers, the full glossary and progress tracking across your devices.
      </p>
      <div className="paywall-actions">
        <BuyButton courseSlug={meta.slug} priceLabel={price} returnTo={returnTo} />
        {!loggedIn && (
          <Link className="btn" href={`/login?next=${encodeURIComponent(returnTo)}`}>
            Already bought it? Log in
          </Link>
        )}
      </div>
      <p className="paywall-preview">
        Not sure yet? <Link href={`/courses/${meta.slug}/unit/${previewUnit}`}>Try Unit {previewUnit} free</Link>
        {' '}— no account needed.
      </p>
    </div>
  );
}

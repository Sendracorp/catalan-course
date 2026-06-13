import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { SITE, siteField } from '@/lib/site';

export const metadata: Metadata = { title: 'Refund Policy' };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated={SITE.lastUpdated}>
      <p>
        We want you to be happy with your course. This policy explains when and how you can get a
        refund for a purchase from {SITE.brand}, operated by {SITE.legalName}.
      </p>

      <h2>14-day money-back guarantee</h2>
      <p>
        If you’re not satisfied, you can request a full refund within <strong>14 days</strong> of your
        purchase — no need to justify your decision. We’ll refund the full amount you paid to your
        original payment method.
      </p>

      <h2>Digital content and your right of withdrawal</h2>
      <p>
        Our courses are digital content supplied online. Under EU consumer law, consumers normally
        have a 14-day right of withdrawal. Because access is granted immediately, by purchasing and
        starting to use the course you ask us to begin supply right away and acknowledge that the
        statutory right of withdrawal ends once access has begun. Our voluntary 14-day money-back
        guarantee above applies regardless, and is more generous than the statutory minimum.
      </p>

      <h2>How to request a refund</h2>
      <ol>
        <li>
          Email us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> within 14 days of purchase.
        </li>
        <li>
          Include the order or receipt ID from the confirmation email sent by Paddle (our payment
          provider and merchant of record).
        </li>
        <li>
          We’ll confirm and process the refund. Refunds are issued by Paddle to your original payment
          method, normally within 14 days of approval (your bank may take a little longer to show it).
        </li>
      </ol>

      <h2>After 14 days</h2>
      <p>
        Beyond the 14-day window we generally don’t offer refunds, since you keep lifetime access to
        the course. If something has gone wrong — a technical problem you couldn’t resolve, a
        duplicate or accidental charge — contact us anyway and we’ll do our best to put it right.
      </p>

      <h2>Contact</h2>
      <p>
        {SITE.legalName} · Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · Phone{' '}
        {siteField(SITE.phone, 'contact phone')}. See also our <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    </LegalPage>
  );
}

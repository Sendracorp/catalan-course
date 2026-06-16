import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { SITE, siteField } from '@/lib/site';

export const metadata: Metadata = { title: 'Refund Policy' };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated={SITE.lastUpdated}>
      <p>
        This policy explains our approach to refunds for purchases from {SITE.brand}, operated by{' '}
        {SITE.legalName}.
      </p>

      <h2>Digital courses are non-refundable once accessed</h2>
      <p>
        Our courses are digital content delivered online, giving you immediate, lifetime access to all
        the material. Because of this, purchases are <strong>non-refundable once you have accessed the
        paid course content</strong>. We encourage you to use the free preview before buying — the
        first unit of every course, the IPA guide and the exam information are available free, with no
        account required.
      </p>

      <h2>Your right of withdrawal (EU consumers)</h2>
      <p>
        EU consumers normally have a 14-day right of withdrawal for online purchases. For digital
        content, this right ends once supply has begun with your prior consent. At checkout you agree
        to immediate access and acknowledge that, once the paid content is made available to you, the
        statutory right of withdrawal no longer applies. Until you access the paid content, you may
        still request cancellation.
      </p>

      <h2>Exceptions — when we will help</h2>
      <p>We’ll review a refund request in these cases:</p>
      <ul>
        <li>A technical problem that prevents you from using the course and that we’re unable to resolve.</li>
        <li>A duplicate or accidental charge.</li>
        <li>You bought the course but never accessed anything beyond the free preview.</li>
      </ul>

      <h2>How to contact us</h2>
      <p>
        Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with the order or receipt ID from the
        confirmation email sent by Paddle (our payment provider and merchant of record). Where a refund
        is granted, it is issued by Paddle to your original payment method, normally within 14 days of
        approval.
      </p>

      <p className="note">
        {SITE.legalName} · Phone {siteField(SITE.phone, 'contact phone')}. See also our{' '}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    </LegalPage>
  );
}

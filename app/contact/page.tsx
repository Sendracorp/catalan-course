import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <LegalPage title="Contact us" updated={SITE.lastUpdated}>
      <p>
        Questions about a course, your account, or a purchase? We’re happy to help.
      </p>

      <h2>{SITE.brand}</h2>
      <p>
        <strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        {SITE.phone && <><br /><strong>Phone:</strong> {SITE.phone}</>}
      </p>
      <p>Email is the fastest way to reach us — we aim to reply within two business days.</p>

      <h2>Billing &amp; payments</h2>
      <p>
        Payments are handled by Paddle, our merchant of record. For invoices, receipts or payment
        questions you can also use{' '}
        <a href="https://www.paddle.com/about/contact" target="_blank" rel="noopener">Paddle’s buyer support</a>,
        or email us and we’ll help. Refunds are covered by our <Link href="/refunds">Refund Policy</Link>.
      </p>
    </LegalPage>
  );
}

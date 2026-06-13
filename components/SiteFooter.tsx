import Link from 'next/link';
import { SITE } from '@/lib/site';

/* Footer linking the pages Paddle's verification expects to find in
   navigation (pricing, terms, refunds, privacy, contact). Rendered on the
   public pages and at the bottom of every course page. */
export default function SiteFooter() {
  return (
    <footer className="site-footer" data-test="site-footer">
      <nav className="site-footer-links">
        <Link href="/">Courses</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p className="site-footer-legal">
        © {SITE.lastUpdated.slice(-4)} {SITE.legalName}. {SITE.brand}. Payments and VAT handled by
        Paddle.com as our merchant of record.
      </p>
    </footer>
  );
}

import Link from 'next/link';
import { SITE } from '@/lib/site';
import Logo from './Logo';

/* Branded footer (deep teal panel). Keeps the verification links Paddle's
   domain review expects, plus brand + legal/MoR line. */
export default function SiteFooter() {
  const year = SITE.lastUpdated.slice(-4);
  return (
    <footer className="site-footer" data-test="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Logo size={34} />
          <p className="footer-tagline">
            Learn languages, properly — interactive courses with full IPA,
            native-speaker audio, auto-marked exercises and real mock exams.
          </p>
          <a className="footer-mail" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          <div className="footer-col">
            <h4>Learn</h4>
            <Link href="/">Courses</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms</Link>
            <Link href="/refunds">Refunds</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <Link href="/contact">Contact</Link>
          </div>
        </nav>
      </div>
      <div className="site-footer-bottom">
        <span>© {year} {SITE.legalName}</span>
        <span>Payments &amp; VAT handled by Paddle.com, our merchant of record.</span>
      </div>
    </footer>
  );
}

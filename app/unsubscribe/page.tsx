import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { verifyUnsubToken } from '@/lib/email';

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/* One-click unsubscribe for lead-magnet emails. The signed token (HMAC of the
   email) authorizes the change without a login, and stops anyone unsubscribing
   an address that isn't theirs. */
export default async function UnsubscribePage({ searchParams }: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e, t } = await searchParams;
  const email = (e ?? '').trim().toLowerCase();
  const valid = !!email && !!t && verifyUnsubToken(email, t);

  if (valid) {
    const a = getAdminSupabase();
    if (a) {
      await a.from('email_leads')
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('email', email).is('unsubscribed_at', null);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="site-main">
        <div className="card">
          <h1>{valid ? 'You’re unsubscribed' : 'Invalid link'}</h1>
          <p className="note">
            {valid
              ? 'You won’t receive any more emails from Verbadium. You can safely close this tab.'
              : 'This unsubscribe link is invalid or has expired. If you keep receiving emails, please contact us.'}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getServerSupabase, getSessionUser } from '@/lib/supabase/server';
import { getSalesBreakdown } from '@/lib/admin';
import { getCourseMeta, mediumForSlug } from '@/lib/courses';
import { LOCALE_LABEL } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Admin · Sales' };
export const dynamic = 'force-dynamic';

const courseLabel = (slug: string) => {
  const m = getCourseMeta(slug);
  return m ? `${m.title} — ${LOCALE_LABEL[mediumForSlug(slug)]}` : slug;
};

export default async function AdminSalesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin/sales');
  const supabase = await getServerSupabase();
  const { data: profile } = await supabase!.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) notFound();

  const b = await getSalesBreakdown();
  const money = (cents: number) => `${(cents / 100).toFixed(2)} ${b.currency}`;

  return (
    <>
      <SiteHeader />
      <main className="site-main">
        <div className="card">
          <h1>Sales &amp; campaigns</h1>
          <p className="note">
            First-party attribution from checkout (UTM / gclid / referrer). ← <Link href="/admin">Back to admin</Link>
          </p>
          <div className="admin-stats">
            <div><b>{b.paid}</b><span>paid sales</span></div>
            <div><b>{b.customers}</b><span>paying customers</span></div>
            <div><b>{money(b.grossCents)}</b><span>gross revenue</span></div>
            <div><b>{b.refunded}</b><span>refunds</span></div>
            <div><b>{money(b.netCents)}</b><span>net revenue</span></div>
          </div>
          <p className="note">Revenue is before Paddle fees/taxes — final figures live in the Paddle dashboard.</p>
        </div>

        <div className="card">
          <h2>By source</h2>
          {b.bySource.length ? (
            <table className="account-table">
              <thead><tr><th>Source</th><th>Sales</th><th>Refunds</th><th>Gross</th></tr></thead>
              <tbody>
                {b.bySource.map(s => (
                  <tr key={s.key}><td>{s.key}</td><td>{s.sales}</td><td>{s.refunds || '—'}</td><td>{money(s.grossCents)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="note">No sales yet.</p>}
        </div>

        {b.byCampaign.length > 0 && (
          <div className="card">
            <h2>By campaign</h2>
            <table className="account-table">
              <thead><tr><th>Campaign (utm_campaign)</th><th>Sales</th><th>Refunds</th><th>Gross</th></tr></thead>
              <tbody>
                {b.byCampaign.map(s => (
                  <tr key={s.key}><td>{s.key}</td><td>{s.sales}</td><td>{s.refunds || '—'}</td><td>{money(s.grossCents)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card">
          <h2>By course</h2>
          {b.byCourse.length ? (
            <table className="account-table">
              <thead><tr><th>Course</th><th>Sales</th><th>Refunds</th><th>Gross</th></tr></thead>
              <tbody>
                {b.byCourse.map(s => (
                  <tr key={s.key}><td>{courseLabel(s.key)}</td><td>{s.sales}</td><td>{s.refunds || '—'}</td><td>{money(s.grossCents)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="note">No sales yet.</p>}
        </div>

        <div className="card">
          <h2>Recent purchases</h2>
          {b.recent.length ? (
            <table className="account-table">
              <thead><tr><th>Date</th><th>Email</th><th>Course</th><th>Status</th><th>Amount</th><th>Source</th><th>Campaign</th></tr></thead>
              <tbody>
                {b.recent.map((r, i) => (
                  <tr key={i}>
                    <td>{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                    <td>{r.email ?? '—'}</td>
                    <td>{courseLabel(r.course_slug)}</td>
                    <td>{r.status}</td>
                    <td>{r.amountCents != null ? `${(r.amountCents / 100).toFixed(2)} ${r.currency ?? ''}` : '—'}</td>
                    <td>{r.source}</td>
                    <td>{r.campaign ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="note">No purchases yet.</p>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

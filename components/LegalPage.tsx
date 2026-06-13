import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/* Shared shell for the static legal/contact pages. */
export default function LegalPage({ title, updated, children }: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="site-main">
        <article className="card legal">
          <h1>{title}</h1>
          {updated && <p className="note">Last updated: {updated}</p>}
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

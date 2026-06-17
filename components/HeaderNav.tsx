'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';

/* Platform nav with active-link highlighting (needs the current path, so it's
   a client component rendered inside the server SiteHeader). */
export default function HeaderNav({ userEmail }: { userEmail: string | null }) {
  const path = usePathname() ?? '/';
  const active = (href: string) => (path === href ? 'active' : '');
  return (
    <nav className="site-nav">
      <Link href="/" className={active('/')}>Courses</Link>
      <Link href="/pricing" className={active('/pricing')}>Pricing</Link>
      {userEmail ? (
        <>
          <Link href="/account" data-test="account-link" className={active('/account')}>{userEmail}</Link>
          <SignOutButton className="site-signout" />
        </>
      ) : (
        <>
          <Link href="/login" data-test="header-login" className={active('/login')}>Log in</Link>
          <Link href="/signup" data-test="header-signup" className="site-cta">Sign up</Link>
        </>
      )}
    </nav>
  );
}

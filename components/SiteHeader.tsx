import Link from 'next/link';
import { getServerSupabase, getSessionUser } from '@/lib/supabase/server';
import Logo from './Logo';
import HeaderNav from './HeaderNav';
import CourseMenuButton from './CourseMenuButton';

/* Floating pill header for the public/marketing pages. `courseMenu` adds the
   mobile course-units toggle (top-left) on course pages. */
export default async function SiteHeader({ courseMenu = false }: { courseMenu?: boolean }) {
  const user = await getSessionUser();
  let isAdmin = false;
  if (user) {
    const supabase = await getServerSupabase();
    const { data: profile } = await supabase!
      .from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    isAdmin = !!profile?.is_admin;
  }
  return (
    <header className={`site-header${courseMenu ? ' has-course-menu' : ''}`}>
      {courseMenu && <CourseMenuButton />}
      <Link href="/" className="site-brand vb-chip" aria-label="Verbadium home"><Logo size={40} /></Link>
      <HeaderNav userEmail={user?.email ?? null} isAdmin={isAdmin} />
    </header>
  );
}

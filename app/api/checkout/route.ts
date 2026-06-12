import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/supabase/server';
import { getCourseMeta } from '@/lib/courses';
import { userOwnsCourse } from '@/lib/access';
import { isPaddleConfigured, paddleClientToken, paddleEnvironment, priceIdFor } from '@/lib/paddle';

/* Auth gate for the Paddle overlay: confirms login + non-ownership, then
   hands the client everything it needs to open the checkout. user_id and
   course_slug travel as customData and come back on the webhook. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Log in to buy a course.' }, { status: 401 });
  }

  const { courseSlug } = await request.json().catch(() => ({}));
  if (!courseSlug || !getCourseMeta(courseSlug)) {
    return NextResponse.json({ error: 'Unknown course.' }, { status: 400 });
  }
  if (await userOwnsCourse(user.id, courseSlug)) {
    return NextResponse.json({ error: 'You already own this course.' }, { status: 409 });
  }

  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured yet on this deployment.' }, { status: 503 });
  }
  const priceId = priceIdFor(courseSlug);
  if (!priceId) {
    return NextResponse.json({ error: 'This course has no price configured yet.' }, { status: 503 });
  }

  return NextResponse.json({
    environment: paddleEnvironment(),
    clientToken: paddleClientToken(),
    priceId,
    email: user.email,
    userId: user.id,
  });
}

import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/** The identity we carry around the app — the only auth fields callers read.
    Sourced from verified JWT claims rather than a full Auth-server user fetch. */
export interface SessionUser { id: string; email: string | null }

/** Cookie-bound Supabase client for Server Components / Route Handlers,
    or null when credentials are placeholders. Wrapped in React.cache() so a
    single request (layout + nested pages) reuses one client + cookie read
    instead of re-parsing cookies for every caller. */
export const getServerSupabase = cache(async (): Promise<SupabaseClient | null> => {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(toSet) {
        // Server Components cannot write cookies; middleware refreshes the session.
        try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* read-only context */ }
      },
    },
  });
});

/** Authenticated user for this request, or null (also null when unconfigured).
    Uses getClaims(), which verifies the JWT signature locally against the
    project's asymmetric signing key (cached JWKS) instead of a network round-trip
    to the Auth server — the middleware (proxy.ts) keeps the session cookie fresh.
    Trade-off: a revoked/signed-out token is trusted until it expires (~1h); paid
    content is additionally gated on the purchases/grants tables on every load.
    Cached per request so a layout and its nested page only verify once. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;
    return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null };
  } catch { return null; }
});

'use server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { sendLeadWelcome } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verbadium.com';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface LeadInput {
  email: string;
  source?: string;       // e.g. 'unit-preview:catalan-a1:1'
  locale?: string;       // teaching medium at capture
  slug?: string;         // course variant slug (for the cheat-sheet / course links)
  attribution?: string;  // JSON first-touch utm/gclid/referrer (from sessionStorage)
}

/* Public opt-in from the free preview. Stores the lead (service role — RLS
   denies anon) and fires the welcome email. Idempotent per email; only the
   first capture triggers an email. Never leaks whether an email already
   existed. */
export async function captureLead(input: LeadInput): Promise<{ ok: boolean; error?: string }> {
  const email = (input.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: 'invalid' };

  const a = getAdminSupabase();
  if (!a) return { ok: false, error: 'unconfigured' };

  let attribution: unknown = null;
  if (input.attribution) { try { attribution = JSON.parse(input.attribution); } catch { /* ignore */ } }

  const { data, error } = await a
    .from('email_leads')
    .upsert(
      { email, source: input.source ?? null, locale: input.locale ?? null, attribution },
      { onConflict: 'email', ignoreDuplicates: true },
    )
    .select('id');

  if (error) return { ok: false, error: 'server' };

  // Only email genuinely-new leads (upsert returns no row on conflict).
  if (data && data.length > 0) {
    const slug = /^[a-z0-9-]+$/.test(input.slug ?? '') ? input.slug! : 'catalan-a1';
    await sendLeadWelcome(email, input.locale ?? 'en', {
      cheat: `${SITE_URL}/courses/${slug}/ipa`,
      course: `${SITE_URL}/courses/${slug}`,
    });
  }
  return { ok: true };
}

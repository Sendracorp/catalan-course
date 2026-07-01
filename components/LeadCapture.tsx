'use client';
import { useState } from 'react';
import { captureLead } from '@/app/actions/leads';
import { getAttribution } from '@/lib/attribution';

export interface LeadCopy {
  heading: string; sub: string; placeholder: string; button: string;
  busy: string; success: string; consent: string; error: string;
}

/* Free-preview email capture (IPA cheat-sheet lead magnet). Rendered at the end
   of the free unit for anonymous visitors — the ones we'd otherwise lose. */
export default function LeadCapture({ copy, source, locale, slug }:
  { copy: LeadCopy; source: string; locale: string; slug: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(false);
    try {
      const attr = getAttribution();
      const res = await captureLead({
        email, source, locale, slug,
        attribution: attr ? JSON.stringify(attr) : undefined,
      });
      if (res.ok) setDone(true); else setError(true);
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="card lead-capture" data-test="lead-success">
        <p className="lead-success">✓ {copy.success}</p>
      </div>
    );
  }

  return (
    <div className="card lead-capture" data-test="lead-capture">
      <h3>{copy.heading}</h3>
      <p className="note">{copy.sub}</p>
      <form onSubmit={submit} className="lead-form">
        <input
          type="email" required autoComplete="email" placeholder={copy.placeholder}
          aria-label={copy.placeholder} value={email}
          onChange={e => setEmail(e.target.value)} disabled={busy}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? copy.busy : copy.button}
        </button>
      </form>
      {error && <p className="auth-error" data-test="lead-error">{copy.error}</p>}
      <p className="lead-consent">{copy.consent}</p>
    </div>
  );
}

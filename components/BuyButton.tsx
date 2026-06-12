'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';

/* Opens the Paddle overlay checkout. /api/checkout is the auth gate —
   401 sends the user to /login and back here afterwards. Access itself is
   granted by the transaction.completed webhook, not the success redirect. */
export default function BuyButton({ courseSlug, priceLabel, returnTo }: {
  courseSlug: string;
  priceLabel: string;
  returnTo: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug }),
      });
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(returnTo)}`);
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Could not start checkout. Please try again.');
        return;
      }
      const paddle = await initializePaddle({ environment: body.environment, token: body.clientToken });
      if (!paddle) {
        setError('Could not load the checkout. Please try again.');
        return;
      }
      paddle.Checkout.open({
        items: [{ priceId: body.priceId, quantity: 1 }],
        customer: { email: body.email },
        customData: { user_id: body.userId, course_slug: courseSlug },
        settings: {
          displayMode: 'overlay',
          successUrl: `${window.location.origin}${returnTo}?purchased=1`,
        },
      });
    } catch {
      setError('Could not start checkout. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="buy-wrap">
      <button type="button" className="btn btn-primary buy-btn" onClick={buy} disabled={busy}>
        {busy ? 'Opening checkout…' : `Buy the course · ${priceLabel}`}
      </button>
      {error && <span className="buy-error">{error}</span>}
    </span>
  );
}

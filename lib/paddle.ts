import 'server-only';

/* Paddle Billing (merchant of record — supports Andorra-based sellers, unlike
   Stripe/Lemon Squeezy). Checkout happens client-side via the Paddle.js
   overlay; the server's job is gating (/api/checkout) and the signed webhook.
   No Paddle API key is needed for this flow. */

export function paddleEnvironment(): 'sandbox' | 'production' {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox';
}

export function paddleClientToken(): string | null {
  const t = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '';
  return t && !t.startsWith('YOUR-') ? t : null;
}

/** Price ID for a course, from PADDLE_PRICE_<SLUG> (dashes → underscores). */
export function priceIdFor(courseSlug: string): string | null {
  const v = process.env[`PADDLE_PRICE_${courseSlug.toUpperCase().replace(/-/g, '_')}`] ?? '';
  return v && !v.startsWith('YOUR-') ? v : null;
}

export function isPaddleConfigured(): boolean {
  return paddleClientToken() !== null;
}

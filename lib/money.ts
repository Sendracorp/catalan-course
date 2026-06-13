/* Pure currency formatting — no server-only deps, so it's unit-testable. */

export function formatMoney(amountMinor: number, currency: string): string {
  const whole = amountMinor % 100 === 0;
  try {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency', currency,
      minimumFractionDigits: whole ? 0 : 2,
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(whole ? 0 : 2)} ${currency}`;
  }
}

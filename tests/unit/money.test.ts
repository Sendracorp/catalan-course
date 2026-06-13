import { describe, it, expect } from 'vitest';
import { formatMoney } from '@/lib/money';

describe('formatMoney', () => {
  it('formats whole euro amounts with no decimals', () => {
    expect(formatMoney(7000, 'EUR')).toBe('€70');
  });
  it('keeps cents when the amount is not whole', () => {
    expect(formatMoney(450, 'EUR')).toBe('€4.50');
  });
  it('handles other currencies', () => {
    expect(formatMoney(3000, 'USD')).toMatch(/\$?US?\$?30/);
  });
  it('falls back gracefully on an unknown currency code', () => {
    expect(formatMoney(7000, 'XYZ')).toContain('XYZ');
  });
});

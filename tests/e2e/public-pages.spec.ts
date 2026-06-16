import { test, expect } from '@playwright/test';

/* Pricing + legal pages + footer — all public, no Supabase needed. These are
   the URLs Paddle's verification needs to find linked from the site. */

test.describe('pricing page', () => {
  test('shows the course price and FAQ', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('[data-test="pricing"]')).toBeVisible();
    await expect(page.locator('[data-test="pricing-catalan-a1"] [data-test="pricing-amount"]')).toContainText('€70');
    await expect(page.locator('.faq-item')).not.toHaveCount(0);
    await expect(page.locator('[data-test="pricing-catalan-a1"] .buy-btn')).toBeVisible();
  });
});

test.describe('legal pages render with content', () => {
  for (const [path, heading, needle] of [
    ['/terms', 'Terms & Conditions', 'merchant of record'],
    ['/refunds', 'Refund Policy', 'non-refundable'],
    ['/privacy', 'Privacy Policy', 'personal data'],
    ['/contact', 'Contact us', 'Email'],
  ] as const) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveText(heading);
      await expect(page.locator('article.legal')).toContainText(needle);
      await expect(page.locator('article.legal')).toContainText('Sendracorp'); // legal name present
    });
  }
});

test.describe('footer', () => {
  test('is on the catalog and links the verification pages', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('[data-test="site-footer"]');
    await expect(footer).toBeVisible();
    for (const [label, path] of [
      ['Pricing', '/pricing'], ['Terms', '/terms'], ['Refunds', '/refunds'],
      ['Privacy', '/privacy'], ['Contact', '/contact'],
    ]) {
      await expect(footer.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', path);
    }
  });

  test('a footer link navigates', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="site-footer"]').getByRole('link', { name: 'Refunds', exact: true }).click();
    await expect(page).toHaveURL(/\/refunds$/);
    await expect(page.locator('h1')).toHaveText('Refund Policy');
  });
});

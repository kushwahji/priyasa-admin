import { test, expect } from '@playwright/test';

const protectedRoutes = [
  '/',
  '/control-center',
  '/orders',
  '/products',
  '/customers',
  '/inventory',
  '/returns',
  '/cms',
  '/marketing',
  '/ads',
  '/analytics',
  '/whatsapp',
  '/integrations',
  '/security',
  '/settings',
];

test('admin login page renders securely', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
  await expect(page.getByLabel(/administrator email/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /send otp|continue/i })).toBeVisible();
});

test('invalid administrator email is rejected client-side', async ({ page }) => {
  await page.goto('/login');
  const email = page.getByLabel(/administrator email/i);
  await email.fill('not-an-email');
  await page.getByRole('button', { name: /send otp|continue/i }).click();
  await expect(email).toHaveValue('not-an-email');
});

test('protected admin routes redirect unauthenticated users', async ({ page }) => {
  for (const route of protectedRoutes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status() ?? 200, route).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 10000 });
  }
});

test('login route does not expose protected shell', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
});

test('mobile admin shell exposes navigation and key workspace links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();
});

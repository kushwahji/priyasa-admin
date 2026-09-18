import { test, expect } from '@playwright/test';

const base = (process.env.PRIYASA_API_BASE_URL || 'https://api.priyasa.com').replace(/\/$/, '');
const token = process.env.PRIYASA_ADMIN_E2E_TOKEN?.trim();

async function coreGet(request: any, path: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await request.get(`${base}${path}`, { headers });
  expect(response.status(), `${path} must not return a server error`).toBeLessThan(500);
  expect(response.headers()['content-type'] || '').toContain('application/json');
  return response;
}

test.describe('PriyasaCore admin API smoke', () => {
  test('health is reachable', async ({ request }) => {
    const response = await coreGet(request, '/api/v1/health');
    expect(response.status()).toBe(200);
  });

  test('authenticated admin resources are reachable when an E2E token is configured', async ({ request }) => {
    test.skip(!token, 'Set PRIYASA_ADMIN_E2E_TOKEN to run authenticated production smoke checks.');
    for (const path of [
      '/api/v1/admin/catalog/products?per_page=1',
      '/api/v1/admin/catalog/categories?per_page=1',
      '/api/v1/admin/catalog/attributes?per_page=1',
      '/api/v1/admin/collections?per_page=1',
      '/api/v1/admin/orders?per_page=1',
      '/api/v1/admin/customers?per_page=1',
      '/api/v1/admin/inventory?per_page=1',
      '/api/v1/admin/returns?per_page=1',
      '/api/v1/admin/reviews?per_page=1',
      '/api/v1/admin/promotions?per_page=1',
      '/api/v1/admin/promotions/campaigns?per_page=1',
      '/api/v1/admin/shipping/shipments?per_page=1',
      '/api/v1/admin/settings',
      '/api/v1/admin/audit-logs?per_page=1',
      '/api/v1/admin/analytics',
      '/api/v1/admin/analytics/overview',
      '/api/v1/admin/analytics/daily',
      '/api/v1/admin/analytics/products?limit=1',
      '/api/v1/admin/admins?per_page=1',
      '/api/v1/admin/roles',
      '/api/v1/admin/merchandising/products?per_page=1',
      '/api/v1/admin/cms',
      '/api/v1/admin/integrations',
      '/api/v1/admin/integrations/woocommerce/status',
      '/api/v1/admin/integrations/meta/status',
      '/api/v1/admin/whatsapp/status',
      '/api/v1/admin/whatsapp/templates',
      '/api/v1/admin/whatsapp/conversations?per_page=1',
      '/api/v1/admin/notifications/templates',
      '/api/v1/admin/notifications/outbox?per_page=1',
      '/api/v1/admin/automations',
      '/api/v1/admin/ops/metrics',
      '/api/v1/admin/ops/audit',
    ]) await coreGet(request, path);
  });

  test('admin login page targets the canonical Core OTP endpoint', async ({ page }) => {
    let requested = '';
    await page.route('**/api/v1/admin/auth/send-otp', async route => {
      requested = route.request().url();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { request_id: '00000000-0000-0000-0000-000000000001', retry_after: 60 } }) });
    });
    await page.goto('/login');
    await page.getByLabel('Administrator email').fill('admin@example.com');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect.poll(() => requested).toContain('/api/v1/admin/auth/send-otp');
  });
});

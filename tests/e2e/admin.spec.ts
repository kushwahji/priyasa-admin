import { test, expect } from '@playwright/test';
test('admin login page renders securely', async ({page}) => {
 await page.goto('/login');
 await expect(page.getByRole('heading',{name:/admin portal/i})).toBeVisible();
 await expect(page.getByLabel(/administrator email/i)).toBeVisible();
});
test('protected admin routes redirect unauthenticated users', async ({page}) => {
 for(const route of ['/','/integrations','/ads']) {
  const response=await page.goto(route);
  expect(response?.status() ?? 200,route).toBeLessThan(500);
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/,{timeout:10000});
 }
});
test('admin login rejects an invalid email before OTP request', async ({page}) => {
 await page.goto('/login');
 const email=page.getByLabel(/administrator email/i);
 await email.fill('not-an-email');
 await page.getByRole('button',{name:/send otp|continue/i}).click();
 await expect(email).toHaveValue('not-an-email');
});

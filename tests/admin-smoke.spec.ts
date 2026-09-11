import {test,expect} from '@playwright/test';

test.describe('Priyasa Admin production smoke',()=>{
 test('unauthenticated workspace redirects to OTP login',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading',{name:/admin portal/i})).toBeVisible();
  await expect(page.getByRole('button',{name:/send otp/i})).toBeVisible();
 });

 test('admin OTP form validates email before request',async({page})=>{
  await page.goto('/login');
  const button=page.getByRole('button',{name:/send otp/i});
  await expect(button).toBeDisabled();
  await page.getByLabel(/administrator email/i).fill('admin@example.com');
  await expect(button).toBeEnabled();
 });
});

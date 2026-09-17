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

 test('authenticated API operations workspace renders the live route inventory',async({page})=>{
  await page.addInitScript(()=>{
   localStorage.setItem('priyasa_admin_token','e2e-test-token');
   localStorage.setItem('priyasa_admin_user',JSON.stringify({name:'E2E Admin',role:'super_admin'}));
  });
  await page.route('**/api/proxy/docs/openapi.routes.json',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[
   {method:'GET',uri:'api/v1/admin/orders',action:'OrderController@index'},
   {method:'POST',uri:'api/v1/admin/orders/{order}/status',action:'OrderController@status'},
   {method:'GET',uri:'api/v1/admin/finance/reports/tax',action:'FinancialReportsController@tax'}
  ]})}));
  await page.goto('/api-ops');
  await expect(page.getByRole('heading',{name:/api operations/i})).toBeVisible();
  await expect(page.getByText('api/v1/admin/orders',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('3 routes',{exact:true})).toBeVisible();
 });

 test('authenticated finance workspace is discoverable from the shell',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('priyasa_admin_token','e2e-test-token'));
  await page.route('**/api/proxy/admin/payments/transactions?per_page=100',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:[]})}));
  await page.goto('/finance');
  await expect(page.getByRole('heading',{name:/finance command center/i})).toBeVisible();
  await expect(page.getByText(/no payment transactions/i)).toBeVisible();
 });
});

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

 test('authenticated control center renders from Core control APIs',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('priyasa_admin_token','e2e-token'));
  await page.route('**/api/v1/admin/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{id:1,name:'E2E Admin',role:'admin'}})}));
  await page.route('**/api/v1/admin/control-center/overview',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{orders:12,sales:12500,customers:8,low_stock:2,returns:1,payment_failures:0}})}));
  await page.route('**/api/v1/admin/control-center/orders**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{data:[]}})}));
  await page.route('**/api/v1/admin/control-center/inventory',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{low_stock:[],out_of_stock:[]}})}));
  await page.route('**/api/v1/admin/control-center/operations',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{status:'healthy',checks:[]}})}));
  await page.goto('/control-center');
  await expect(page.getByRole('heading',{name:/commerce control center/i})).toBeVisible();
  await expect(page.getByText('12',{exact:true}).first()).toBeVisible();
  await expect(page.getByText(/operational cockpit/i)).toBeVisible();
 });
});

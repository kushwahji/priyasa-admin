import {test,expect} from '@playwright/test';

test.describe('AI Studio',()=>{
 test('loads provider dashboard and product generation review flow',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('priyasa_admin_token','e2e-test-token'));
  await page.route('**/api/proxy/admin/ai/providers',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{providers:[{id:1,key:'gemini',name:'Gemini',driver:'gemini',model:'gemini-test',enabled:true,configured:true,priority:10,base_url:null,timeout_seconds:30,max_retries:2}]}})}));
  await page.route('**/api/proxy/admin/ai/health',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{enabled:1,configured:1,providers:[{key:'gemini',enabled:true,configured:true,model:'gemini-test'}]}})}));
  await page.route('**/api/proxy/admin/ai/products/42/generate',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{product_id:42,sections:{content:{generation_id:101,provider:'gemini',model:'gemini-test',content:{title:'Festive Kurta Set',description:'A premium festive kurta set.',short_description:'Premium festive ethnic wear.'}},seo:{generation_id:102,provider:'gemini',model:'gemini-test',content:{meta_title:'Festive Kurta Set | PRIYASA',meta_description:'Shop a festive kurta set from PRIYASA.',slug:'festive-kurta-set',tags:['festive','kurta']}}}})}));
  await page.route('**/api/proxy/admin/ai/products/42/apply',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{product_id:42,updated_fields:['description'],generation_id:101}})}));
  await page.goto('/ai?product=42');
  await expect(page.getByRole('heading',{name:'AI Studio'})).toBeVisible();
  await expect(page.getByText('Gemini',{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:/generate ai draft/i}).click();
  await expect(page.getByText(/human approval required/i).first()).toBeVisible();
  const description=page.locator('textarea').filter({hasText:'A premium festive kurta set.'}).first();
  await expect(description).toHaveValue('A premium festive kurta set.');
  await description.fill('Edited by admin before approval.');
  const card=description.locator('xpath=ancestor::label');
  await card.getByRole('checkbox').check();
  await page.getByRole('button',{name:/apply selected fields/i}).first().click();
  await expect(page.getByText(/applied 1 reviewed field/i)).toBeVisible();
 });
});

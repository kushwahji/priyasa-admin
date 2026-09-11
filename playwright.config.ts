import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
 testDir:'./tests',
 timeout:30000,
 fullyParallel:true,
 forbidOnly:!!process.env.CI,
 retries:process.env.CI?2:0,
 reporter:process.env.CI?[['list'],['html',{open:'never'}]]:[['list']],
 use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3000',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
});

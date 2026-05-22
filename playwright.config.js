const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  // Use a single browser (Chromium) as required by project testing guidelines.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start:backend',
      url: 'http://127.0.0.1:3030/',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run start:frontend',
      url: 'http://127.0.0.1:3000/',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
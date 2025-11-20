import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration for E2E tests
 * Tests validate the complete export flow and JSON output
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:6006',
  //   reuseExistingServer: !process.env.CI,
  // },
});

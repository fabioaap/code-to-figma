import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright Configuration for E2E Tests
 * 
 * Environment Variables:
 * - E2E_BASE_URL: Base URL for the Storybook instance (default: http://localhost:6006)
 * - E2E_HEADLESS: Run tests in headless mode (default: true)
 * - E2E_TIMEOUT: Timeout for each test in milliseconds (default: 30000)
 * - CI: Set to 'true' when running in CI environment
 */

// Validate required environment for E2E tests
function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if running in CI
  const isCI = process.env.CI === 'true';

  // Validate base URL
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:6006';
  if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
    errors.push('E2E_BASE_URL must start with http:// or https://');
  }

  // Check if Storybook is likely to be running (in non-CI environments)
  if (!isCI && baseURL.includes('localhost')) {
    warnings.push('E2E tests require a running Storybook instance. Make sure to start it with: pnpm dev');
  }

  // Report validation results
  if (warnings.length > 0) {
    console.warn('\n⚠️  E2E Environment Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  if (errors.length > 0) {
    console.error('\n❌ E2E Environment Validation Failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('E2E environment validation failed. Please check the errors above.');
  }

  console.log('\n✅ E2E Environment validated successfully');
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   Headless: ${process.env.E2E_HEADLESS ?? 'true'}`);
  console.log(`   Timeout: ${process.env.E2E_TIMEOUT ?? '30000'}ms\n`);
}

// Run validation before tests
validateEnvironment();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:6006',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Timeout for each action */
    actionTimeout: parseInt(process.env.E2E_TIMEOUT || '30000'),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'pnpm --filter @figma-sync-engine/example-react-button dev',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

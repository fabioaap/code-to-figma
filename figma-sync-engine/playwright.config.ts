import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './scripts',
    testMatch: '**/e2e-*.spec.ts',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 1,
    reporter: [
        ['html', { outputFolder: 'scripts/reports/html' }],
        ['json', { outputFile: 'scripts/reports/report.json' }],
        ['list'],
    ],
    use: {
        baseURL: 'http://localhost:6006',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    webServer: {
        command: 'cd examples/react-button && pnpm exec storybook dev -p 6006',
        url: 'http://localhost:6006',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    }, projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});

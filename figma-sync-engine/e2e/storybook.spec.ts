import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Storybook Instance
 * 
 * These tests validate that the Storybook instance is running correctly
 * and can be accessed by the E2E test suite.
 */

test.describe('Storybook Instance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Storybook home page
    await page.goto('/');
  });

  test('should load Storybook successfully', async ({ page }) => {
    // Wait for the Storybook UI to be visible
    await page.waitForLoadState('networkidle');
    
    // Check that we're on a Storybook page
    // Storybook typically has an iframe for the story preview
    const storyIframe = page.frameLocator('#storybook-preview-iframe');
    await expect(storyIframe.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should display the sidebar navigation', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for common Storybook UI elements
    // Note: Storybook's UI structure may vary, these are common patterns
    const sidebar = page.locator('[role="navigation"], .sidebar, #storybook-explorer-menu');
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test('should have accessible story content', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the preview iframe is present
    const iframe = page.locator('#storybook-preview-iframe');
    await expect(iframe).toBeVisible({ timeout: 10000 });
    
    // Verify that the iframe has loaded content
    const storyIframe = page.frameLocator('#storybook-preview-iframe');
    const body = storyIframe.locator('body');
    await expect(body).toBeVisible();
  });

  test('should respond to viewport changes', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify the page still renders correctly
    const storyIframe = page.frameLocator('#storybook-preview-iframe');
    await expect(storyIframe.locator('body')).toBeVisible();
    
    // Set back to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(storyIframe.locator('body')).toBeVisible();
  });
});

test.describe('Environment Validation', () => {
  test('should confirm environment is properly configured', async ({ page }) => {
    // This test validates that the environment setup is working
    const response = await page.goto('/');
    
    // Check that we got a successful response
    expect(response?.status()).toBeLessThan(400);
    
    // Verify the page loaded
    await expect(page).toHaveTitle(/Storybook/i, { timeout: 10000 });
  });

  test('should have correct base URL configured', async ({ page, baseURL }) => {
    // Verify the base URL is set correctly
    expect(baseURL).toBeDefined();
    expect(baseURL).toMatch(/^https?:\/\//);
    
    // Navigate using the base URL
    await page.goto('/');
    
    // Verify we can access the page
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toContain(baseURL!);
  });
});

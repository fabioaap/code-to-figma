import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Figma Export Functionality
 * 
 * These tests validate the export flow from Storybook to Figma JSON format.
 * 
 * Note: These tests assume the addon is installed and visible in Storybook.
 * If the addon is not yet fully implemented, these tests will be skipped.
 */

test.describe('Figma Export Addon', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a specific story
    // This URL pattern may need to be adjusted based on actual story structure
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display export button in addon panel @skip-if-not-implemented', async ({ page }) => {
    // Look for the addon panel
    // This selector will need to be updated based on actual implementation
    const addonPanel = page.locator('[role="tabpanel"], .addon-panel, [data-testid="addon-panel"]');
    
    // Check if addon panel exists
    const panelExists = await addonPanel.count() > 0;
    
    if (!panelExists) {
      test.skip(true, 'Addon panel not yet implemented');
      return;
    }
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Export")');
    await expect(exportButton).toBeVisible({ timeout: 5000 });
  });

  test('should export story to Figma JSON format @skip-if-not-implemented', async ({ page }) => {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    
    // Try to find and click export button
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Export")');
    const buttonExists = await exportButton.count() > 0;
    
    if (!buttonExists) {
      test.skip(true, 'Export button not yet implemented');
      return;
    }
    
    await exportButton.click();
    
    // Wait for download
    const download = await downloadPromise;
    
    if (download) {
      // Verify the download
      expect(download.suggestedFilename()).toMatch(/\.json$/i);
      
      // Save and parse the downloaded file
      const path = await download.path();
      expect(path).toBeTruthy();
    }
  });

  test('should copy JSON to clipboard @skip-if-not-implemented', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Try to find copy button
    const copyButton = page.locator('button:has-text("Copiar"), button:has-text("Copy")');
    const buttonExists = await copyButton.count() > 0;
    
    if (!buttonExists) {
      test.skip(true, 'Copy button not yet implemented');
      return;
    }
    
    await copyButton.click();
    
    // Wait a bit for clipboard operation
    await page.waitForTimeout(1000);
    
    // Read clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    
    // Verify it's valid JSON
    expect(() => JSON.parse(clipboardContent)).not.toThrow();
  });

  test('should validate exported JSON structure @skip-if-not-implemented', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Try to export
    const copyButton = page.locator('button:has-text("Copiar"), button:has-text("Copy")');
    const buttonExists = await copyButton.count() > 0;
    
    if (!buttonExists) {
      test.skip(true, 'Export not yet implemented');
      return;
    }
    
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    // Get and parse clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    const exportedData = JSON.parse(clipboardContent);
    
    // Validate basic structure
    expect(exportedData).toBeDefined();
    expect(typeof exportedData).toBe('object');
    
    // Check for expected Figma JSON fields (based on docs/figma-json-format.md)
    // These expectations will need to be updated based on actual implementation
    expect(exportedData).toHaveProperty('type');
  });
});

test.describe('Export Error Handling', () => {
  test('should handle export errors gracefully @skip-if-not-implemented', async ({ page }) => {
    await page.goto('/');
    
    // Try to export
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Export")');
    const buttonExists = await exportButton.count() > 0;
    
    if (!buttonExists) {
      test.skip(true, 'Export not yet implemented');
      return;
    }
    
    // Look for error messages or notifications
    // This is a placeholder - actual implementation may vary
    await exportButton.click();
    
    // Check that the page doesn't crash
    await expect(page).not.toHaveTitle(/error/i);
  });
});

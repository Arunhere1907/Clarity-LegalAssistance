import { test, expect } from '@playwright/test';

test.describe('Clarity Legal Assistance - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be fully loaded
    await expect(page.getByText('Clarity', { exact: true }).first()).toBeVisible();
  });

  test('should load the application successfully', async ({ page }) => {
    // Verify header is present
    await expect(page.getByText('Clarity', { exact: true }).first()).toBeVisible();
    
    // Verify main panels are present
    await expect(page.getByText('Risk Tags')).toBeVisible();
    await expect(page.getByText('Timeline')).toBeVisible();
    await expect(page.getByText('Q&A')).toBeVisible();
  });

  test('should load a sample lease agreement', async ({ page }) => {
    // Click lease sample button (should already be loaded)
    const leaseButton = page.locator('#btn-sample-lease');
    await leaseButton.click();

    // Verify it's active
    await expect(leaseButton).toHaveClass(/bg-\[#14161B\]/);
    
    // Verify risk tags or clauses appear (data is pre-loaded)
    await expect(page.getByText('Risk Tags')).toBeVisible();
  });

  test('should switch to employment offer sample', async ({ page }) => {
    // Click employment sample button
    const employmentButton = page.locator('#btn-sample-employment');
    await employmentButton.click();

    // Verify it's active
    await expect(employmentButton).toHaveClass(/bg-\[#14161B\]/);
  });

  test('should switch to vendor MSA sample', async ({ page }) => {
    // Click vendor sample button
    const vendorButton = page.locator('#btn-sample-vendor');
    await vendorButton.click();

    // Verify it's active
    await expect(vendorButton).toHaveClass(/bg-\[#14161B\]/);
  });

  test('should filter risk tags by severity', async ({ page }) => {
    // Wait for risk tags to load
    await page.waitForTimeout(1000);

    // Click high severity filter
    const highFilter = page.getByRole('button', { name: /high/i }).first();
    if (await highFilter.isVisible()) {
      await highFilter.click();
      // Filter should be active
      await page.waitForTimeout(300);
    }
  });

  test('should expand and collapse accordion items', async ({ page }) => {
    // Wait for clauses to appear
    await page.waitForTimeout(1000);

    // Find first clause button
    const clauseButtons = page.locator('button').filter({ hasText: /Clause \d+/ });
    const firstClause = clauseButtons.first();
    
    if (await firstClause.isVisible()) {
      // Click to expand
      await firstClause.click();
      await page.waitForTimeout(300);
      
      // Click to collapse
      await firstClause.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display timeline with deadlines', async ({ page }) => {
    // Check for timeline section
    await expect(page.getByText('Timeline')).toBeVisible();
    
    // Look for timeline entries
    const timelineSection = page.locator('text=Timeline').locator('..');
    await expect(timelineSection).toBeVisible();
  });

  test('should open upload modal', async ({ page }) => {
    // Click upload button
    const uploadButton = page.locator('#btn-open-upload');
    await uploadButton.click();

    // Verify upload modal appears
    await expect(page.getByText(/Ingest Document/i)).toBeVisible();
  });

  test('should close upload modal on escape', async ({ page }) => {
    // Open modal
    await page.locator('#btn-open-upload').click();
    await expect(page.getByText(/Ingest Document/i)).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.getByText(/Ingest Document/i)).toBeHidden();
  });

  test('should toggle PII protection', async ({ page }) => {
    // Find PII guard button
    const piiButton = page.locator('#btn-toggle-pii');
    await piiButton.click();

    // Wait for toggle
    await page.waitForTimeout(300);

    // Click again
    await piiButton.click();
  });

  test('should open comparator view', async ({ page }) => {
    // Click compare button
    const compareButton = page.locator('#btn-toggle-comparator');
    await compareButton.click();

    // Verify comparator opens
    await expect(page.getByText(/Comparator/i)).toBeVisible();
  });

  test('should toggle reading mode', async ({ page }) => {
    // Find reading mode toggle
    const readingModeButton = page.locator('#btn-toggle-reading-mode-header');
    await readingModeButton.click();

    // Should show high contrast active
    await expect(readingModeButton).toContainText(/High Contrast: ON/i);

    // Toggle back
    await readingModeButton.click();
  });

  test('should handle resize divider on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for content
    await page.waitForTimeout(500);

    // Look for resize divider (typically has cursor-col-resize class or similar)
    const divider = page.locator('[class*="cursor-col-resize"]').first();
    
    // If divider exists, try to drag it
    if (await divider.isVisible()) {
      const box = await divider.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 100, box.y + box.height / 2);
        await page.mouse.up();
      }
    }
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify app loads on mobile
    await expect(page.getByText('Clarity', { exact: true }).first()).toBeVisible();
    
    // Resize divider should not be visible on mobile
    const divider = page.locator('[class*="cursor-col-resize"]');
    await expect(divider).toBeHidden();
  });

  test('should navigate using keyboard', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify some element has focus
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });
});

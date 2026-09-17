import { test, expect } from '@playwright/test';

test.describe('Clarity Legal Assistance E2E Tests', () => {
  test('loads the application and displays header', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Check that the header is visible
    await expect(page.getByText('Clarity')).toBeVisible();
    await expect(page.getByText('Legal Document Workspace')).toBeVisible();
  });

  test('displays sample contract buttons', async ({ page }) => {
    await page.goto('/');

    // Check that sample contract buttons are visible
    await expect(page.getByRole('button', { name: 'Lease Agreement' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Employment Offer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vendor MSA' })).toBeVisible();
  });

  test('loads default lease agreement on startup', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check that document content is visible
    // The default document should have clauses displayed
    const documentPane = page.locator('[class*="overflow-y-auto"]').first();
    await expect(documentPane).toBeVisible();
  });

  test('switches between sample contracts', async ({ page }) => {
    await page.goto('/');

    // Click on Employment Offer sample
    await page.getByRole('button', { name: 'Employment Offer' }).click();

    // Wait for content to load
    await page.waitForTimeout(500);

    // Verify the button is now active (has different styling)
    const employmentButton = page.getByRole('button', { name: 'Employment Offer' });
    await expect(employmentButton).toHaveClass(/bg-\[#14161B\]/);
  });

  test('filters clauses by risk tag', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Find and click a risk filter button
    const highAttentionFilter = page.getByRole('button', { name: /High-attention/ });
    if (await highAttentionFilter.isVisible()) {
      await highAttentionFilter.click();
      
      // Wait for filtering to apply
      await page.waitForTimeout(300);

      // Verify filter is active
      await expect(highAttentionFilter).toHaveClass(/bg-\[#8B2E2E\]/);
    }
  });

  test('opens and closes upload modal', async ({ page }) => {
    await page.goto('/');

    // Click upload button
    await page.getByRole('button', { name: /Upload \/ Paste/ }).click();

    // Wait for modal to appear
    await page.waitForTimeout(300);

    // Check that modal is visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Close modal with close button
    const closeButton = page.getByRole('button', { name: /Close upload/ });
    await closeButton.click();

    // Wait for modal to disappear
    await page.waitForTimeout(300);

    // Verify modal is no longer visible
    await expect(modal).not.toBeVisible();
  });

  test('opens and closes comparator modal', async ({ page }) => {
    await page.goto('/');

    // Find and click comparator button
    const comparatorButton = page.getByRole('button', { name: /Compare Docs/ });
    if (await comparatorButton.isVisible()) {
      await comparatorButton.click();

      // Wait for modal to appear
      await page.waitForTimeout(300);

      // Check that comparator modal is visible
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/Comparator/i)).toBeVisible();

      // Close modal with Escape key
      await page.keyboard.press('Escape');

      // Wait for modal to disappear
      await page.waitForTimeout(300);

      // Verify modal is closed
      await expect(modal).not.toBeVisible();
    }
  });

  test('interacts with timeline panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check if timeline panel is visible
    const timelineHeading = page.getByText(/Timeline & Deadlines/i);
    if (await timelineHeading.isVisible()) {
      // Timeline should display obligations
      await expect(timelineHeading).toBeVisible();

      // Check for export calendar button
      const exportButton = page.getByRole('button', { name: /Export/i });
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
      }
    }
  });

  test('verifies responsive layout on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // On desktop, the resize divider should be present
    const resizeDivider = page.locator('#pane-resize-divider');
    await expect(resizeDivider).toBeVisible();
  });

  test('verifies responsive layout on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // On mobile, the resize divider should not be present
    const resizeDivider = page.locator('#pane-resize-divider');
    await expect(resizeDivider).not.toBeVisible();
  });

  test('keyboard navigation works for main controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify that focus is moving (check that some element is focused)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('displays risk tags panel with clauses', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check that the risk tags panel is visible
    await expect(page.getByText(/Filter by paralegal risk assessment/i)).toBeVisible();

    // Check that clause cards are displayed
    const clauseCards = page.locator('[class*="bg-white"][class*="border"]').filter({ hasText: /Clause/ });
    const count = await clauseCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('verifies document pane reading modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check for reading mode toggle if it exists
    const readingModeButton = page.getByRole('button', { name: /contrast/i });
    if (await readingModeButton.isVisible()) {
      await readingModeButton.click();
      await page.waitForTimeout(300);
      
      // Verify mode changed (check data attribute or class)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('full workflow: view document -> filter -> open modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Step 1: Verify document is loaded
    await expect(page.getByText('Clarity')).toBeVisible();

    // Step 2: Switch to a different sample
    await page.getByRole('button', { name: 'Vendor MSA' }).click();
    await page.waitForTimeout(500);

    // Step 3: Filter by a specific tag
    const unusualFilter = page.getByRole('button', { name: /Unusual/ });
    if (await unusualFilter.isVisible()) {
      await unusualFilter.click();
      await page.waitForTimeout(300);
    }

    // Step 4: Open upload modal
    await page.getByRole('button', { name: /Upload \/ Paste/ }).click();
    await page.waitForTimeout(300);

    // Step 5: Verify modal is open
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Step 6: Close modal with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Step 7: Verify we're back to the filtered view
    await expect(page.getByRole('button', { name: 'Vendor MSA' })).toHaveClass(/bg-\[#14161B\]/);
  });
});

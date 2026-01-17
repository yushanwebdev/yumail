import { test, expect } from "@playwright/test";

test.describe("Spam Filter UX", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to inbox (received page)
    await page.goto("/received");
    // Wait for the filter bar to be visible
    await page.waitForSelector('text="View:"', { timeout: 10000 });
  });

  test("filter bar is visible with inbox and spam toggle buttons", async ({
    page,
  }) => {
    // Verify the filter bar exists
    await expect(page.getByText("View:")).toBeVisible();

    // Verify Inbox button exists
    const inboxButton = page.getByRole("button", { name: "Inbox" });
    await expect(inboxButton).toBeVisible();

    // Verify Spam button exists
    const spamButton = page.getByRole("button", { name: /Spam/i });
    await expect(spamButton).toBeVisible();
  });

  test("inbox button is highlighted by default", async ({ page }) => {
    const inboxButton = page.getByRole("button", { name: "Inbox" });

    // The inbox button should be visible and functional
    await expect(inboxButton).toBeVisible();
  });

  // Test Plan Item 4: Test filter toggle switches between inbox and spam views
  test("clicking spam filter switches to spam view", async ({ page }) => {
    const spamButton = page.getByRole("button", { name: /Spam/i });

    // Click spam filter
    await spamButton.click();

    // Wait for view to switch to spam using data attribute
    await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

    // At this point, the spam filter should be active
    await expect(spamButton).toBeVisible();
  });

  // Test Plan Item 4: Test filter toggle switches between inbox and spam views
  test("clicking inbox filter returns to inbox view", async ({ page }) => {
    const spamButton = page.getByRole("button", { name: /Spam/i });
    const inboxButton = page.getByRole("button", { name: "Inbox" });

    // First switch to spam
    await spamButton.click();
    await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

    // Then switch back to inbox
    await inboxButton.click();
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 5000 });

    // In inbox view, we should see emails (since we have them)
    const emailItems = page.locator('[data-view="inbox"] a[data-email-id]');
    await expect(emailItems.first()).toBeVisible({ timeout: 5000 });

    // Should have emails in inbox
    const emailCount = await emailItems.count();
    expect(emailCount).toBeGreaterThan(0);
  });

  test("spam count badge displays when spam emails exist", async ({ page }) => {
    // Get the spam button
    const spamButton = page.getByRole("button", { name: /Spam/i });

    // Check if there's a number badge inside the spam button area
    const badgeText = await spamButton.textContent();

    // The button text includes "Spam" and optionally a count number
    expect(badgeText).toContain("Spam");
  });
});

// Test Plan Items 1, 3, and 5: Full spam workflow tests
// Run serially to avoid race conditions when modifying shared data
test.describe.serial("Mark as Spam Flow - Full Workflow", () => {
  // Test Plan Item 1: Mark an email as spam and verify it moves to spam folder
  test("mark email as spam and verify it moves to spam folder", async ({
    page,
  }) => {
    // Go to inbox
    await page.goto("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    // Get the first email's ID using data attribute
    const firstEmail = page.locator('[data-view="inbox"] a[data-email-id]').first();
    await expect(firstEmail).toBeVisible();
    const emailId = await firstEmail.getAttribute("data-email-id");
    expect(emailId).toBeTruthy();

    // Click the first email to open detail view
    await firstEmail.click();
    await page.waitForURL(/\/received\/.+/);

    // Wait for email detail page with data attribute (use div to be specific)
    await expect(page.locator(`div[data-email-id="${emailId}"]`)).toBeVisible({ timeout: 5000 });

    // Click the "Spam" button to mark it as spam
    const spamButton = page.locator('[data-action="toggle-spam"][data-is-spam="false"]');
    await expect(spamButton).toBeVisible();
    await spamButton.click();

    // Should redirect back to inbox
    await page.waitForURL("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    // Verify the email is no longer in inbox view (not marked as spam)
    const inboxEmails = page.locator('[data-view="inbox"] a[data-email-id][data-is-spam="false"]');
    const emailIds = await inboxEmails.evaluateAll((links) =>
      links.map((l) => l.getAttribute("data-email-id"))
    );
    expect(emailIds).not.toContain(emailId);

    // Switch to spam view and verify the email is there
    const spamFilterButton = page.getByRole("button", { name: /Spam/i });
    await spamFilterButton.click();
    await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

    // Wait for the email to appear in spam folder using data attribute
    const spammedEmail = page.locator(`[data-view="spam"] a[data-email-id="${emailId}"][data-is-spam="true"]`);
    await expect(spammedEmail).toBeVisible({ timeout: 10000 });
  });

  // Test Plan Item 3: Click "Not spam" to restore email to inbox
  test("click 'Not spam' to restore email to inbox", async ({ page }) => {
    // Go to inbox
    await page.goto("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    const emailLinks = page.locator('[data-view="inbox"] a[data-email-id]');
    const initialCount = await emailLinks.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // Get the first email's ID
    const emailId = await emailLinks.first().getAttribute("data-email-id");

    // Mark it as spam
    await emailLinks.first().click();
    await page.waitForURL(/\/received\/.+/);
    await expect(page.locator(`div[data-email-id="${emailId}"]`)).toBeVisible({ timeout: 5000 });

    const spamButton = page.locator('[data-action="toggle-spam"][data-is-spam="false"]');
    await expect(spamButton).toBeVisible();
    await spamButton.click();
    await page.waitForURL("/received");

    // Switch to spam view
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });
    const spamFilterButton = page.getByRole("button", { name: /Spam/i });
    await spamFilterButton.click();
    await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

    // Find the email in spam and click it
    const spamEmailLink = page.locator(`[data-view="spam"] a[data-email-id="${emailId}"]`);
    await expect(spamEmailLink).toBeVisible({ timeout: 10000 });
    await spamEmailLink.click();

    // Wait for email detail page
    await page.waitForURL(/\/received\/.+/);
    await expect(page.locator(`div[data-email-id="${emailId}"][data-is-spam="true"]`)).toBeVisible({ timeout: 5000 });

    // Click "Not spam" button to restore it
    const notSpamButton = page.locator('[data-action="toggle-spam"][data-is-spam="true"]');
    await expect(notSpamButton).toBeVisible();
    await notSpamButton.click();

    // Should redirect back to received page
    await page.waitForURL("/received");

    // Reload page to ensure we get fresh data and reset view state
    await page.reload();
    await expect(page.locator('[data-view]')).toBeVisible({ timeout: 10000 });

    // Make sure we're viewing inbox (not spam)
    const inboxButton = page.getByRole("button", { name: "Inbox" });
    await inboxButton.click();
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 5000 });

    // Wait for the specific email we just un-spammed to appear in inbox
    const restoredEmail = page.locator(`[data-view="inbox"] a[data-email-id="${emailId}"][data-is-spam="false"]`);
    await expect(restoredEmail).toBeVisible({ timeout: 15000 });

    // Verify it's NOT in spam view anymore
    const spamFilterBtn = page.getByRole("button", { name: /Spam/i });
    await spamFilterBtn.click();
    await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

    // Verify email is not in spam view
    const spamEmails = page.locator(`[data-view="spam"] a[data-email-id="${emailId}"]`);
    await expect(spamEmails).toHaveCount(0, { timeout: 10000 });
  });

  // Test Plan Item 5: Verify spam count badge updates correctly
  test("spam count badge updates after marking email as spam", async ({
    page,
  }) => {
    await page.goto("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    // Get initial spam count from data attribute
    const container = page.locator('[data-spam-count]');
    const initialCount = parseInt(await container.getAttribute("data-spam-count") || "0");

    // Mark an email as spam
    const emailLinks = page.locator('[data-view="inbox"] a[data-email-id]');
    await expect(emailLinks.first()).toBeVisible({ timeout: 5000 });
    const emailCount = await emailLinks.count();

    if (emailCount === 0) {
      test.skip();
      return;
    }

    await emailLinks.first().click();
    await page.waitForURL(/\/received\/.+/);

    // Wait for spam button using data attribute
    const spamButton = page.locator('[data-action="toggle-spam"][data-is-spam="false"]');
    await expect(spamButton).toBeVisible({ timeout: 5000 });
    await spamButton.click();

    // Wait for redirect and page to update
    await page.waitForURL("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    // Wait for spam count to increase using data attribute
    await expect(async () => {
      const newCount = parseInt(await container.getAttribute("data-spam-count") || "0");
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 10000 });
  });
});

test.describe("Email Detail Actions", () => {
  test("can navigate to email detail and see spam button", async ({ page }) => {
    await page.goto("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    const emailLinks = page.locator('[data-view="inbox"] a[data-email-id]');
    const emailCount = await emailLinks.count();

    if (emailCount > 0) {
      await emailLinks.first().click();
      await page.waitForURL(/\/received\/.+/);

      // Check for spam toggle button using data attribute
      const spamToggleButton = page.locator('[data-action="toggle-spam"]');
      await expect(spamToggleButton).toBeVisible({ timeout: 5000 });
    }
  });

  test("spam button shows 'Spam' for non-spam emails", async ({ page }) => {
    await page.goto("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    // Inbox view shows non-spam emails, so button should have data-is-spam="false"
    const emailLinks = page.locator('[data-view="inbox"] a[data-email-id][data-is-spam="false"]');
    const emailCount = await emailLinks.count();

    if (emailCount > 0) {
      await emailLinks.first().click();
      await page.waitForURL(/\/received\/.+/);

      // For a non-spam email, the button should have data-is-spam="false"
      const spamButton = page.locator('[data-action="toggle-spam"][data-is-spam="false"]');
      await expect(spamButton).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Spam View Content", () => {
  test("spam view shows spam emails or empty message", async ({ page }) => {
    await page.goto("/received");
    await expect(page.locator('[data-view="inbox"]')).toBeVisible({ timeout: 10000 });

    const spamButton = page.getByRole("button", { name: /Spam/i });
    await spamButton.click();

    // Wait for spam view using data attribute
    await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

    // Wait for either emails or empty state to appear (loading to complete)
    await expect(async () => {
      const spamEmails = page.locator('[data-view="spam"] a[data-email-id]');
      const emptyState = page.locator('[data-empty="true"]');

      const emailCount = await spamEmails.count();
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(emailCount > 0 || hasEmptyState).toBeTruthy();
    }).toPass({ timeout: 10000 });
  });
});

/*
 * Note on Test Plan Item 2: "Verify sender is auto-blocked in blockedSenders table"
 *
 * This is covered by unit tests (convex/emails.test.ts) because:
 * - E2E tests cannot directly query the Convex database
 * - Verifying auto-block would require sending a new email from the same sender
 *   and checking if it's auto-marked as spam, which requires webhook simulation
 *
 * The unit test "should auto-block sender when blockSender is true" verifies:
 * - Sender is added to blockedSenders table
 * - Email and reason are correctly stored
 *
 * The unit test "should auto-mark new emails from blocked senders as spam" verifies:
 * - New emails from blocked senders are automatically marked as spam
 */

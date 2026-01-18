# Testing Guide

This document covers the testing strategy, patterns, and best practices for the YuMail project.

## Table of Contents

- [E2E Testing Setup](#e2e-testing-setup)
- [Data Attributes for Testing](#data-attributes-for-testing)
- [Test Patterns](#test-patterns)
- [Running Tests](#running-tests)

---

## E2E Testing Setup

### Local Convex Backend

E2E tests run against a **local Convex backend** (not the cloud database) to ensure test isolation and prevent data loss.

**Why local backend?**
- Complete isolation from production data
- Faster test execution
- Reproducible test state
- Safe to seed/clear data

**Setup:**

```bash
# Start local Convex backend (Docker required)
docker compose -f docker-compose.test.yml up -d

# Run E2E tests
npx playwright test
```

**Configuration files:**
- `docker-compose.test.yml` - Local Convex container
- `.env.test.local` - Local Convex credentials
- `playwright.config.ts` - Points to local Convex URL
- `tests/global-setup.ts` - Seeds test data before tests
- `tests/global-teardown.ts` - Clears test data after tests

### Test Data Seeding

Test data is managed via Convex mutations in `convex/testSeed.ts`:

```typescript
// Seed test data (called in global-setup.ts)
await client.mutation(api.testSeed.seedTestData, {});

// Clear test data (called in global-teardown.ts)
await client.mutation(api.testSeed.clearTestData, {});
```

---

## Data Attributes for Testing

### Why Data Attributes?

We use `data-*` attributes instead of arbitrary timeouts or fragile selectors because:

1. **Explicit state waiting** - Tests wait for specific states, not arbitrary delays
2. **Self-documenting** - Clear what state the test expects
3. **Decoupled from styling** - Tests don't break when CSS classes change
4. **Faster execution** - Playwright knows exactly what to watch for

### Before & After

```typescript
// ❌ BEFORE: Fragile, slow, unreliable
await page.waitForTimeout(1000);
const emailLinks = page.locator('a[href^="/received/"]');
const pageContent = await page.content();
expect(pageContent.includes("No spam")).toBeTruthy();

// ✅ AFTER: Explicit, fast, reliable
await expect(page.locator('[data-view="spam"]')).toBeVisible();
const emailLinks = page.locator('[data-view="inbox"] a[data-email-id]');
await expect(page.locator('[data-empty="true"]')).toBeVisible();
```

### Available Data Attributes

#### View State (`inbox-email-list.tsx`)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-view` | `"inbox"` \| `"spam"` | Current filter view |
| `data-spam-count` | Number | Count of spam emails |

```tsx
<div data-view={filter === "spam" ? "spam" : "inbox"} data-spam-count={spamCount}>
```

**Usage in tests:**
```typescript
// Wait for view to switch
await expect(page.locator('[data-view="spam"]')).toBeVisible();

// Get spam count
const count = await page.locator('[data-spam-count]').getAttribute('data-spam-count');
```

#### Email Items (`email-list.tsx`)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-email-id` | String | Convex document ID |
| `data-is-spam` | `"true"` \| `"false"` | Spam status |
| `data-is-read` | `"true"` \| `"false"` | Read status |
| `data-folder` | `"inbox"` \| `"sent"` | Email folder |
| `data-empty` | `"true"` | Empty state indicator |

```tsx
<Link
  data-email-id={email._id}
  data-is-spam={email.isSpam ?? false}
  data-is-read={email.isRead}
  data-folder={email.folder}
>
```

**Usage in tests:**
```typescript
// Get first email ID
const emailId = await page.locator('a[data-email-id]').first().getAttribute('data-email-id');

// Find specific email
const email = page.locator(`a[data-email-id="${emailId}"]`);

// Find non-spam emails in inbox view
const inboxEmails = page.locator('[data-view="inbox"] a[data-email-id][data-is-spam="false"]');

// Check for empty state
await expect(page.locator('[data-empty="true"]')).toBeVisible();
```

#### Email Detail Actions (`email-detail-actions.tsx`)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-action` | `"toggle-spam"` | Action type |
| `data-is-spam` | `"true"` \| `"false"` | Current spam state |

```tsx
<Button
  data-action="toggle-spam"
  data-is-spam={isSpam}
>
```

**Usage in tests:**
```typescript
// Click spam button (for non-spam email)
const spamButton = page.locator('[data-action="toggle-spam"][data-is-spam="false"]');
await spamButton.click();

// Click "Not spam" button (for spam email)
const notSpamButton = page.locator('[data-action="toggle-spam"][data-is-spam="true"]');
await notSpamButton.click();
```

#### Email Detail Page (`received/[id]/page.tsx`)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-email-id` | String | Convex document ID |
| `data-is-spam` | `"true"` \| `"false"` | Spam status |

```tsx
<div
  data-email-id={email._id}
  data-is-spam={email.isSpam ?? false}
>
```

**Usage in tests:**
```typescript
// Wait for email detail page to load
await expect(page.locator(`div[data-email-id="${emailId}"]`)).toBeVisible();

// Verify email is marked as spam on detail page
await expect(page.locator(`div[data-email-id="${emailId}"][data-is-spam="true"]`)).toBeVisible();
```

---

## Test Patterns

### 1. Waiting for State Changes

**Don't use arbitrary timeouts:**
```typescript
// ❌ Bad
await page.waitForTimeout(1000);
```

**Do use explicit state waits:**
```typescript
// ✅ Good - wait for specific element
await expect(page.locator('[data-view="spam"]')).toBeVisible({ timeout: 5000 });

// ✅ Good - wait for element to disappear
await expect(page.locator(`a[data-email-id="${emailId}"]`)).toHaveCount(0);

// ✅ Good - polling assertion for dynamic conditions
await expect(async () => {
  const count = parseInt(await container.getAttribute('data-spam-count') || '0');
  expect(count).toBeGreaterThan(initialCount);
}).toPass({ timeout: 10000 });
```

### 2. Selecting Elements

**Be specific with selectors:**
```typescript
// ❌ Bad - too generic, may match multiple elements
page.locator('[data-email-id]')

// ✅ Good - scoped to current view
page.locator('[data-view="inbox"] a[data-email-id]')

// ✅ Good - specific element type to avoid conflicts
page.locator(`div[data-email-id="${emailId}"]`)  // Detail page container
page.locator(`a[data-email-id="${emailId}"]`)    // Email list link
```

### 3. Testing State Transitions

```typescript
test("mark email as spam and verify it moves", async ({ page }) => {
  // 1. Get initial state
  const emailId = await page.locator('a[data-email-id]').first().getAttribute('data-email-id');

  // 2. Perform action
  await page.locator(`a[data-email-id="${emailId}"]`).click();
  await page.locator('[data-action="toggle-spam"][data-is-spam="false"]').click();

  // 3. Verify state change
  await expect(page.locator('[data-view="inbox"]')).toBeVisible();

  // 4. Verify email moved
  const inboxEmails = page.locator('[data-view="inbox"] a[data-email-id]');
  const ids = await inboxEmails.evaluateAll(links =>
    links.map(l => l.getAttribute('data-email-id'))
  );
  expect(ids).not.toContain(emailId);
});
```

### 4. Handling Empty States

```typescript
// Check for either content or empty state
await expect(async () => {
  const emails = page.locator('[data-view="spam"] a[data-email-id]');
  const emptyState = page.locator('[data-empty="true"]');

  const emailCount = await emails.count();
  const hasEmptyState = await emptyState.isVisible().catch(() => false);

  expect(emailCount > 0 || hasEmptyState).toBeTruthy();
}).toPass({ timeout: 10000 });
```

---

## Running Tests

### Commands

```bash
# Run all E2E tests
npx playwright test

# Run with UI mode (debugging)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/spam.spec.ts

# Run with headed browser
npx playwright test --headed

# Show test report
npx playwright show-report
```

### Prerequisites

1. **Docker** must be running for local Convex backend
2. **Local Convex** container must be started:
   ```bash
   docker compose -f docker-compose.test.yml up -d
   ```

### Debugging Failed Tests

1. Check the error context file in `test-results/`
2. Run with `--ui` flag for interactive debugging
3. Add `await page.pause()` to pause test execution
4. Check data attributes in browser DevTools

---

## Adding New Data Attributes

When adding new testable features:

1. **Identify state that tests need to observe**
2. **Add data attributes to relevant components**
3. **Use semantic names** (e.g., `data-is-loading`, `data-has-error`)
4. **Document in this file**

Example:
```tsx
// Component
<div data-loading={isLoading} data-error={hasError}>

// Test
await expect(page.locator('[data-loading="false"]')).toBeVisible();
```

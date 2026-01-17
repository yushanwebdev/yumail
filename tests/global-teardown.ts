import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

/**
 * Global teardown for E2E tests with LOCAL Convex backend.
 * Cleans up test data after all tests complete.
 */
async function globalTeardown() {
  // Always use local Convex for E2E tests
  const convexUrl = "http://127.0.0.1:3210";

  console.log(`\n[E2E Teardown] Connecting to LOCAL Convex at ${convexUrl}...`);

  const client = new ConvexHttpClient(convexUrl);

  try {
    // Clear test data
    console.log("[E2E Teardown] Clearing test data...");
    const result = await client.mutation(api.testSeed.clearTestData, {});
    console.log(`[E2E Teardown] ${result.message}`);
  } catch (error) {
    console.error("[E2E Teardown] Failed to clear test data:", error);
    // Don't throw - we don't want cleanup failures to fail the test run
  }
}

export default globalTeardown;

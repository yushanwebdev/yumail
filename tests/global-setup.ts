import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

/**
 * Global setup for E2E tests with LOCAL Convex backend.
 * Seeds the database with test data before all tests run.
 */
async function globalSetup() {
  // Always use local Convex for E2E tests
  const convexUrl = "http://127.0.0.1:3210";

  console.log(`\n[E2E Setup] Connecting to LOCAL Convex at ${convexUrl}...`);

  const client = new ConvexHttpClient(convexUrl);

  try {
    // Seed test data
    console.log("[E2E Setup] Seeding test data...");
    const result = await client.mutation(api.testSeed.seedTestData, {});
    console.log(`[E2E Setup] ${result.message}`);
    console.log(
      `[E2E Setup] Created ${result.inboxCount} inbox emails, ${result.sentCount} sent emails`
    );
  } catch (error) {
    console.error("[E2E Setup] Failed to seed test data:", error);
    throw error;
  }
}

export default globalSetup;

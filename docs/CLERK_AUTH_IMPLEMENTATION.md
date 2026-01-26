# Clerk Authentication Implementation

This document summarizes the issues encountered and solutions implemented when adding Clerk authentication to YuMail.

## Issues & Solutions

### 1. Route Protection
**Issue:** All routes were publicly accessible.
**Solution:** Created `middleware.ts` using `clerkMiddleware()` to protect all routes except `/sign-in`.

### 2. Convex + Clerk Integration
**Issue:** Need to wrap Convex with Clerk authentication.
**Solution:** Updated `lib/convex.tsx` to use `ClerkProvider` with `ConvexProviderWithClerk`, passing `useAuth` hook.

### 3. Next.js 16 Suspense Warning
**Issue:** "Accessing data outside of Suspense" error with ClerkProvider.
**Solution:** Added `dynamic` prop to ClerkProvider and wrapped children in `<Suspense>` in `app/layout.tsx`.

### 4. Deprecated Clerk Prop
**Issue:** Warning about deprecated `afterSignInUrl` prop.
**Solution:** Changed env var from `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` to `NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL`.

### 5. Missing JWT Template (404 Errors)
**Issue:** 404 errors fetching `/tokens/convex` from Clerk.
**Solution:** Created JWT template named exactly `convex` in Clerk Dashboard → Configure → JWT Templates.

### 6. Convex Data Not Protected
**Issue:** Convex queries/mutations were publicly accessible even with route protection.
**Solution:** Added `requireAuth()` helper in `convex/emails.ts` that calls `ctx.auth.getUserIdentity()` and throws "Unauthorized" if null. Applied to all queries and user-initiated mutations.

### 7. API Route Authentication
**Issue:** API routes needed auth for calling Convex mutations.
**Solution:** In `/api/email/send/route.ts`, get Clerk token with `getToken({ template: "convex" })` and pass to `ConvexHttpClient.setAuth(token)`.

### 8. Server-Side Preload Auth Failure
**Issue:** `preloadQuery` in server components failed with "Unauthorized" because no auth token was passed.
**Solution:** Pass the Clerk JWT token to `preloadQuery` options:
```typescript
async function getAuthToken() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  return token ?? undefined;
}

const token = await getAuthToken();
const preloadedStats = await preloadQuery(api.emails.getStats, {}, { token });
```

### 9. auth.config.ts Environment Variable
**Issue:** `process.env.CLERK_JWT_ISSUER_DOMAIN` was undefined, causing auth to fail.
**Solution:** Added `CLERK_JWT_ISSUER_DOMAIN` to both:
- `.env.local` (read during `npx convex dev` push)
- Convex Dashboard → Settings → Environment Variables

## Files Modified/Created

| File | Action |
|------|--------|
| `middleware.ts` | Created - route protection |
| `lib/convex.tsx` | Modified - ClerkProvider wrapper |
| `app/layout.tsx` | Modified - Suspense boundary |
| `app/sign-in/[[...sign-in]]/page.tsx` | Created - sign-in page |
| `app/page.tsx` | Modified - added UserButton |
| `convex/auth.config.ts` | Created - Convex auth configuration |
| `convex/emails.ts` | Modified - added requireAuth to all queries/mutations |
| `app/api/email/send/route.ts` | Modified - Clerk token for Convex |
| `app/api/email/content/[id]/route.ts` | Modified - auth check |
| `app/api/email/attachment/[emailId]/[attachmentId]/route.ts` | Modified - auth check |
| `components/dashboard/loaders.tsx` | Modified - client-side data fetching |
| `components/dashboard/stat-values.tsx` | Modified - direct props instead of preloaded |
| `components/dashboard/recent-unread-section.tsx` | Modified - direct props |
| `components/dashboard/top-senders-section.tsx` | Modified - direct props |
| `.env.example` | Modified - added Clerk env vars |

## Environment Variables Required

```env
# Clerk (in .env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=/
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# Convex Dashboard
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

## Clerk Dashboard Configuration

1. **JWT Template:** Create template named `convex` (Configure → JWT Templates → New → Convex)
2. **Passkeys (optional):** Enable in Configure → Email, Phone, Username → Passkeys

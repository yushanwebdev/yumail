# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yumail is an email client built with Expo SDK 55 (React Native 0.83, New Architecture enabled, React Compiler enabled). It fetches emails from the Resend API and displays them in an inbox with day-based filtering.

## Development Commands

- `npx expo start` — Start the dev server
- `npx expo run:ios` — Build and run on iOS simulator
- `npx expo run:android` — Build and run on Android emulator
- `npx expo lint` — Run ESLint (flat config with eslint-config-expo)

No test framework is configured.

## Architecture

**Routing:** Expo Router with file-based routing (`app/` directory). Two screens: inbox list (`app/index.tsx`) and email detail (`app/email/[id].tsx`). Stack navigator with headers hidden on the inbox screen.

**Data fetching:** React Query (`@tanstack/react-query`). The `QueryClientProvider` wraps the app in `app/_layout.tsx`. Two query hooks:

- `useEmails` (`hooks/useEmails.ts`) — infinite query that paginates through the Resend API, auto-fetching pages until the selected date is covered
- `useEmailDetail` (`hooks/useEmailDetail.ts`) — single email detail query

**State management:** Zustand with AsyncStorage persistence for read status tracking (`stores/useReadStatusStore.ts`).

**API:** Resend receiving API (`https://api.resend.com/emails/receiving`). API key is sourced from `EXPO_PUBLIC_RESEND_API_KEY` env var.

**Lists:** Uses `@legendapp/list` (`LegendList`) for performant virtualized lists with item recycling.

**Styling:** No styling library — uses React Native `StyleSheet`. Design tokens (colors, spacing, radii, fonts) are in `constants/theme.ts`.

**Fonts:** Inter and Playfair Display, embedded natively via `expo-font` plugin. Font names differ between iOS and Android — use the `fonts` object from `constants/theme.ts` (which handles `Platform.select`).

**Platform variants:** Some components have `.web.tsx` variants (e.g., `EmailRow.web.tsx`, `InboxHeader.web.tsx`). Web also has a `NavRail` sidebar component.

## Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/components/Foo` not `../../components/Foo`.

## Key Conventions

- TypeScript strict mode
- Typed routes enabled (`experiments.typedRoutes` in app.json)
- Package manager: Bun (bun.lock present)
- Always refer to the Expo documentation (docs.expo.dev) when integrating any Expo package for configuration requirements
- Create meaningful modular commits

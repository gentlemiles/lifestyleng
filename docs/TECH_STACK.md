# Architecture, Tech Stack & Dependency Governance
**Project:** LifestyleNG.com — Unified Multi-Service Platform  
**Parent Organization:** Lifestyle Corporate Networks Ltd.  
**Priority Level:** CRITICAL (Locks Framework Versions, Libraries & Build Tooling)

## 1. Canonical Stack Matrix

| Layer | Technology | Version / Standard | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.x` (React `19.x`) | Server Components (RSC) by default, Server Actions, `after()` non-blocking hooks, strict caching tags. |
| **Language** | TypeScript | `5.7+` (`strict: true`) | End-to-end type safety with `noImplicitAny: true` and `noUncheckedIndexedAccess: true`. |
| **Styling & UI** | Tailwind CSS + Radix UI | Tailwind `v4` / `v3.4+` | Enforces Apple HIG design tokens (`#F5F5F7` canvas, continuous squircle radii, frosted glass). |
| **Database** | PostgreSQL | `16.x` | ACID transactions, row-level locking (`SELECT ... FOR UPDATE`), and JSONB metadata support. |
| **ORM & Migrations** | Drizzle ORM + `drizzle-kit` | `0.38+` | Zero-overhead SQL generation, strict TypeScript schema inference, and explicit transaction control. |
| **Validation** | Zod + `@t3-oss/env-nextjs` | `3.24+` | Shared client/server input validation and fail-fast environment variable verification. |
| **Payments** | Paystack (Primary) + Flutterwave | REST + HMAC Webhooks | Native Nigerian Naira (`NGN`) integer kobo settlement, bank transfer, USSD, and card support. |
| **Notifications** | WhatsApp Deep-Links + Resend | `wa.me/2348064912969` | Deterministic divisional WhatsApp concierge escalation paired with transactional email receipts. |
| **Testing** | Vitest + Playwright | Latest | Deterministic unit tests for kobo math, 24h returns, 2h car-hire rule, and full E2E browser flows. |
| **Package Manager** | `pnpm` | `9.x+` | Deterministic lockfile and strict dependency isolation. |

---

## 2. Server-First Execution Rules
1. **React Server Components (RSC) by Default:** All route pages (`page.tsx`) and layouts (`layout.tsx`) are Server Components unless interactive client state (`useState`, `useOptimistic`, `useTransition`) is strictly required.
2. **Zero Client-Side Secret Exposure:** Payment secret keys (`PAYSTACK_SECRET_KEY`, `FLUTTERWAVE_SECRET_KEY`), database credentials (`DATABASE_URL`), and session signing keys (`SESSION_SECRET`) are restricted to server modules via `@t3-oss/env-nextjs`.
3. **Permanent `/mtn-fibrex` Route Alias:** `next.config.ts` enforces a `308` permanent redirect from `/mtn-fibrex` to `/mtn-services/fibrex` so marketing materials and links using either path resolve with zero friction.
4. **Font Loading (`next/font/google`):** Load `Plus Jakarta Sans` (`--font-display`, weights `500, 600, 700`) and `Inter` (`--font-sans`, weights `400, 500, 600`) with `display: 'swap'` to guarantee `0.00` Cumulative Layout Shift (CLS).

# Hostinger Tier 2 (Growth Unlimited) & PostgreSQL CMS Deployment Guide

**Platform:** `LifestyleNG.com` — Lifestyle Corporate Networks Ltd. (Abuja, Nigeria)  
**Target Environment:** Hostinger Tier 2 — Growth Unlimited (Node.js Web App + LiteSpeed + Custom Domain + Managed PostgreSQL + Protected `/admin` CMS)

This guide walks through verifying the build locally, pushing to GitHub (`gentlemiles/lifestyleng`), deploying on Hostinger, connecting your managed PostgreSQL database, and securing Admin CMS login credentials.

---

## 1. Prerequisites

- **Node.js `>= 20.9.0`** (Node 22 LTS recommended) and **`pnpm`** (or **`npm`**).
- GitHub repository: `https://github.com/gentlemiles/lifestyleng` (branch `main`).
- **Hostinger Tier 2 (Growth Unlimited)** with **Node.js Web App** enabled in hPanel.
- A **Managed PostgreSQL** database connection string (`DATABASE_URL`) — either Hostinger PostgreSQL (VPS/Cloud/Database add-on) or a managed PostgreSQL provider such as Neon or Supabase.

---

## 2. Verify Locally Before Pushing

### Windows PowerShell 5.1
```powershell
cd C:\Users\HP\Desktop\LifestyleNG
pnpm install
pnpm typecheck; pnpm lint; pnpm test:unit; pnpm test:integration
npm run build
```

---

## 3. Push Updates to GitHub

```powershell
cd C:\Users\HP\Desktop\LifestyleNG
git status
git add .
git commit -m "feat: secure /admin CMS with login auth and PostgreSQL persistence"
git push origin main
```

---

## 4. Generate Production Admin Credentials & Secrets

The Operations CMS at **`/admin`** is intentionally hidden from the public storefront and protected by:
1. Edge Middleware (`src/middleware.ts`) redirecting unauthenticated visitors to **`/admin/login`**.
2. Server-side session verification inside `src/app/(admin)/layout.tsx`.
3. Server Action RBAC guards (`requireAdmin()`) on every mutating CMS action.
4. `X-Robots-Tag: noindex, nofollow` headers so search engines never index `/admin`.

Before deploying to Hostinger, generate a strong `SESSION_SECRET` and a salted scrypt `ADMIN_PASSWORD_HASH` locally:

```powershell
# 1. Generate a 64-character SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Generate a salted scrypt ADMIN_PASSWORD_HASH (replace YOUR_STRONG_PASSWORD)
node -e "const c=require('crypto'),s=c.randomBytes(16).toString('hex'),h=c.scryptSync('YOUR_STRONG_PASSWORD',s,64).toString('hex');console.log(s+':'+h)"
```

> **Fail-Closed Security:** In production (`NODE_ENV=production`), `/admin/login` refuses all sign-ins until `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (or `ADMIN_PASSWORD`, or a PostgreSQL `users` table admin row) are configured.

---

## 5. Deploy on Hostinger hPanel (Node.js Web App)

1. Open **Hostinger hPanel** → **Websites** → **Add Website** → **Node.js Web App**.
2. Connect GitHub repository **`gentlemiles/lifestyleng`** on branch **`main`**.
3. Configure build & runtime settings:
   - **Node.js Version:** `22.x` (`>= 20.9.0`)
   - **Install Command:** `pnpm install --frozen-lockfile` *(or `npm install`)*
   - **Build Command:** `pnpm build` *(or `npm run build`)*
   - **Start Command:** `pnpm start` *(or `npm run start`)*
4. Add **Environment Variables** in Hostinger hPanel (see `.env.example`):

| Variable | Value | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `production` | Enables production security & secure cookies |
| `NEXT_PUBLIC_APP_URL` | `https://lifestyleng.com` | Canonical domain & OpenGraph URLs |
| `NEXT_PUBLIC_PAYMENT_MODE` | `sandbox` | Enables Bank Transfer & Sandbox checkout until Paystack keys are ready |
| `NEXT_PUBLIC_WHATSAPP_PRIMARY` | `2348064912969` | Official Wuye / LifestyleNG WhatsApp concierge line |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname?sslmode=require` | Managed PostgreSQL for permanent CMS persistence (`cms_state` table is auto-created on first run) |
| `ADMIN_EMAIL` | `admin@lifestyleng.com` | Authorized administrator email for `/admin/login` |
| `ADMIN_PASSWORD_HASH` | `<saltHex:hashHex>` | Salted scrypt hash generated in Step 4 |
| `SESSION_SECRET` | `<64-char hex>` | Signs `HttpOnly` `lifestyleng_session` cookies |
| `CRON_SECRET` | `<random secret>` | Secures `/api/cron/release-stock` |

5. Click **Deploy**, connect **`lifestyleng.com`** under **Websites → Domains**, and enable **Force HTTPS** under **Security → SSL**.
6. Sign in privately at **`https://lifestyleng.com/admin/login`** to manage products, Wuye inventory, apartments/rooms, car hire fleet, and pages.

---

## 6. How PostgreSQL Persistence Works
- When `DATABASE_URL` points to your live PostgreSQL database, [cms-store.ts](../src/server/services/cms-store.ts) automatically creates the `cms_state` table (`CREATE TABLE IF NOT EXISTS cms_state`) and persists every CMS change (products, pricing, stock, categories, pages, Prince & Princess Estate rooms, and fleet) directly inside PostgreSQL.
- Every edit survives Hostinger deployments, restarts, and scaling.
- To also push the full relational Drizzle schema (`users`, `orders`, `stay_bookings`, etc.) to your PostgreSQL database, run:
  ```powershell
  pnpm db:push
  ```

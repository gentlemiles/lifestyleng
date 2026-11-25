# Hostinger Tier 2 (Growth Unlimited) & Decap CMS Deployment Guide

**Platform:** `LifestyleNG.com` — Lifestyle Corporate Networks Ltd. (Abuja, Nigeria)  
**Target Environment:** Hostinger Tier 2 — Growth Unlimited (Node.js Web App + LiteSpeed + Custom Domain + Git-backed Decap CMS)

This guide walks through verifying the build locally, pushing the codebase to GitHub, deploying to Hostinger, connecting your custom domain (`lifestyleng.com`), and enabling browser-based content editing with Decap CMS.

---

## 1. Prerequisites

Before deploying, confirm you have:
- **Node.js `>= 20.9.0`** (Node 22 LTS recommended) and **`pnpm`** (or **`npm`**) installed locally.
- A **GitHub account** (personal or Lifestyle Corporate Networks Ltd. organization) with an empty repository created (for example, `https://github.com/<your-org>/lifestyleng`).
- A **Hostinger Tier 2 (Growth Unlimited)** hosting plan with **Node.js Web App** support enabled in hPanel.
- Ownership of **`lifestyleng.com`** (either registered at Hostinger or managed via external DNS).

---

## 2. Verify the Build Locally

Always confirm TypeScript, linting, tests, and the Next.js production build pass cleanly before pushing to GitHub.

### Windows PowerShell 5.1
```powershell
cd C:\Users\HP\Desktop\LifestyleNG
pnpm install
pnpm typecheck; pnpm lint; pnpm test:unit
pnpm build
```

### macOS / Linux / Git Bash (or npm equivalent)
```bash
npm install
npm run typecheck && npm run lint && npm run test:unit
npm run build
```

To preview the production bundle locally before deploying:
```powershell
pnpm start
# Open http://localhost:3000
# Built-in Operations Dashboard: http://localhost:3000/admin
# Decap CMS Editor: http://localhost:3000/admin/index.html
```

---

## 3. Push the Repository to GitHub

First confirm `.gitignore` is keeping `.env`, `.env.local`, `.next/`, `.data/`, and `node_modules/` out of version control.

```powershell
# 1. Initialize Git (skip if already initialized)
git init -b main

# 2. Check untracked/staged files — verify NO .env or .next/ files appear
git status

# 3. Stage and create the initial commit
git add .
git commit -m "chore: prepare LifestyleNG platform for Hostinger Tier 2 deployment"

# 4. Connect your GitHub repository (replace <YOUR_GITHUB_USERNAME> with your real GitHub user/org)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/lifestyleng.git

# 5. Push main branch to GitHub
git push -u origin main
```

> **Tip:** Before pushing for production, open `public/admin/config.yml` and replace `YOUR_GITHUB_USERNAME/lifestyleng` under `backend.repo` with your actual GitHub `owner/repo` slug, then commit and push that update.

---

## 4. Deploy to Hostinger Tier 2 (Growth Unlimited)

LifestyleNG uses **Next.js 15 App Router**, Server Actions, dynamic checkout verification, and an operational admin dashboard (`/admin`), so deploy using **Hostinger's Node.js Web App** workflow connected to your GitHub repository.

### Step-by-Step in Hostinger hPanel
1. Log in to **Hostinger hPanel** → **Websites** → **Add Website** (or open your existing `lifestyleng.com` site).
2. Choose **Node.js Web App** (or open **Advanced → Git / Node.js** on Business/Cloud Node.js hosting) and connect your **GitHub account**.
3. Select your repository (`<YOUR_GITHUB_USERNAME>/lifestyleng`) and branch **`main`**.
4. Configure the build and runtime settings:
   - **Node.js Version:** `22.x` (minimum `20.9+`, declared in `package.json` `engines.node`)
   - **Package Manager:** `pnpm` (or `npm`)
   - **Install Command:** `pnpm install --frozen-lockfile` (or `npm install`)
   - **Build Command:** `pnpm build` (or `npm run build`)
   - **Start Command:** `pnpm start` (or `npm run start`)
   - **Application Root:** `/` (repository root)
5. Add **Environment Variables** in Hostinger hPanel using `.env.example` as your reference:

| Variable | Recommended Production Value | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | Required by Next.js |
| `NEXT_PUBLIC_APP_URL` | `https://lifestyleng.com` | Powers canonical SEO URLs & metadataBase |
| `NEXT_PUBLIC_PAYMENT_MODE` | `sandbox` | Keeps Bank Transfer & Sandbox checkout active until Paystack goes live; change to `live` when ready |
| `NEXT_PUBLIC_WHATSAPP_PRIMARY` | `2348064912969` | Official Wuye / LifestyleNG WhatsApp concierge line |
| `SESSION_SECRET` | *(32+ char random string)* | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CRON_SECRET` | *(24+ char random string)* | Secures `/api/cron/release-stock` |
| `DATABASE_URL` | *(PostgreSQL URL, if attached)* | Leave default or attach managed Postgres when enabling DB persistence |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Optional while `NEXT_PUBLIC_PAYMENT_MODE="sandbox"` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` or `pk_live_...` | Optional while `NEXT_PUBLIC_PAYMENT_MODE="sandbox"` |

6. Click **Deploy**. Hostinger pulls `main`, runs `build`, starts the Next.js server, and routes traffic through LiteSpeed.

### Static Caching, Security Headers & `.htaccess`
- `next.config.ts` sets `images: { unoptimized: true }` so local `/images/stays/prince-and-princess/*` photography, `/images/lcn-logo-full.png`, and Decap uploads in `/images/uploads/*` serve reliably on Hostinger without native `sharp` binary mismatches.
- `next.config.ts` and `public/.htaccess` both enforce:
  - HTTPS redirection and HSTS (`max-age=63072000; includeSubDomains; preload`)
  - Permanent `308` redirect from `/mtn-fibrex` to `/mtn-services/fibrex`
  - Long-lived caching for `/images/*` assets and `no-store` caching for `/admin/config.yml`
  - Security headers (`X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`)

---

## 5. Custom Domain & Free SSL Setup (`lifestyleng.com`)

### Option A: Domain Registered at Hostinger
1. In hPanel, open **Websites → Domains** and connect **`lifestyleng.com`** directly to your Node.js Web App.
2. Hostinger automatically configures the A/CNAME records and provisions a **Free Lifetime SSL Certificate (Let's Encrypt)**.
3. Under **Security → SSL**, enable **Force HTTPS**.

### Option B: Domain Registered Externally (Namecheap, Cloudflare, GoDaddy, etc.)
1. Copy the **Hostinger IPv4 address** from hPanel → **Hosting → Plan Details**.
2. Create these DNS records at your registrar:
   - **`A` Record:** Host `@` → `<Hostinger IPv4 Address>` (TTL: Auto / 300s)
   - **`CNAME` Record:** Host `www` → `lifestyleng.com`
3. Wait 5–30 minutes for DNS propagation, then install **Let's Encrypt SSL** in hPanel → **Security → SSL**.
4. Confirm `NEXT_PUBLIC_APP_URL` in Hostinger environment variables is set to `https://lifestyleng.com` and redeploy.
5. *(Optional)* Once both `lifestyleng.com` and `www.lifestyleng.com` have valid SSL, uncomment the `www` → apex redirect lines in `public/.htaccess`.

---

## 6. Decap CMS Setup & GitHub OAuth Configuration

LifestyleNG includes **two complementary admin surfaces**:
- **`/admin`** — Built-in Next.js Operations Dashboard (live orders, Wuye POS stock, stays bookings, car hire dispatch, MTN leads).
- **`/admin/index.html`** — Git-backed **Decap CMS** content editor managing structured repository files under `content/products/`, `content/categories/`, `content/pages/`, and `content/apartments/`, with media saved to `public/images/uploads/`.

### A. Update Repository Target
Edit `public/admin/config.yml` and set your live GitHub repository:
```yaml
backend:
  name: github
  repo: <YOUR_GITHUB_USERNAME>/lifestyleng
  branch: main
  base_url: https://oauth.lifestyleng.com   # Your GitHub OAuth proxy URL
  auth_endpoint: /auth
```

### B. Create a GitHub OAuth App
Because Hostinger does not bundle Netlify's built-in GitHub OAuth service, Decap CMS uses a tiny OAuth proxy (free on Cloudflare Workers or a Hostinger Node microservice) to exchange GitHub OAuth codes securely without exposing your Client Secret in the browser.

1. Open **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name:** `LifestyleNG Decap CMS`
   - **Homepage URL:** `https://lifestyleng.com`
   - **Authorization callback URL:** `https://oauth.lifestyleng.com/callback` *(match the callback path of your chosen OAuth proxy)*
3. Copy the **Client ID** and generate a **Client Secret**.
4. Deploy an open-source Decap GitHub OAuth proxy (such as `sterlingwes/decap-proxy` or `sveltia/sveltia-cms-auth` on Cloudflare Workers) with secrets:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `ALLOWED_DOMAINS=lifestyleng.com`
5. Uncomment `base_url` and `auth_endpoint` in `public/admin/config.yml`, commit, and push to `main`.
6. Visit `https://lifestyleng.com/admin/index.html`, click **Login with GitHub**, and authorize the app.

### C. Editing Content Locally (No OAuth Needed)
`public/admin/config.yml` ships with `local_backend: true` (automatically ignored on HTTPS production). To test Decap CMS on your machine:
```powershell
# Terminal 1: start Next.js dev server
pnpm dev

# Terminal 2: start local Decap proxy server
npx decap-server
```
Then open `http://localhost:3000/admin/index.html` to edit **Products**, **Categories**, **Pages**, and **Apartments** directly against local files in `content/`.

---

## 7. Switching Checkout from Sandbox / Bank Transfer to Live Paystack

Out of the box, `NEXT_PUBLIC_PAYMENT_MODE="sandbox"` enables:
- **Bank Transfer / Manual Order Placement** with Lifestyle Corporate Networks Ltd. transfer instructions and WhatsApp confirmation (`+234 806 491 2969`).
- **Sandbox / Test Payment Mode** for internal QA without requiring live Paystack keys.

When ready to accept live card & transfer payments via Paystack:
1. Obtain live `pk_live_...` and `sk_live_...` keys from your verified Paystack dashboard.
2. Update Hostinger environment variables:
   - `NEXT_PUBLIC_PAYMENT_MODE="live"`
   - `PAYSTACK_SECRET_KEY="sk_live_..."`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_..."`
3. Configure your Paystack Webhook URL to `https://lifestyleng.com/api/webhooks/paystack`.
4. Redeploy from Hostinger hPanel and complete a live ₦100 verification test.

---

## 8. Post-Deployment Smoke Test Checklist

After every deployment to Hostinger, verify:
- [ ] `https://lifestyleng.com/` loads cleanly over HTTPS with the LifestyleNG logo and all 4 corporate divisions.
- [ ] `https://lifestyleng.com/shop/clothes` displays seeded fashion SKUs, category filters, and search (`?q=`).
- [ ] `https://lifestyleng.com/stays` and `/stays/kaura-4-bedroom-luxury-duplex` render all Prince & Princess Estate room photos and booking options.
- [ ] `https://lifestyleng.com/mtn-fibrex` returns an **HTTP 308 redirect** to `/mtn-services/fibrex`.
- [ ] `https://lifestyleng.com/checkout` handles empty cart cleanly, supports Bank Transfer & Sandbox checkout, and completes `/checkout/verify`.
- [ ] `https://lifestyleng.com/admin` opens the Next.js Operations Dashboard without errors.
- [ ] `https://lifestyleng.com/admin/index.html` loads Decap CMS and fetches `/admin/config.yml` with HTTP 200.

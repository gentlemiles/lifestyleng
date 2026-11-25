# Infrastructure, Runtime Environment & Deployment Specification
**Project:** LifestyleNG.com  
**Parent Organization:** Lifestyle Corporate Networks Ltd.  
**Priority Level:** SCALE-UP & PRODUCTION LAUNCH GUARDRAIL

## 1. Strict Runtime Environment Schema (`src/env.ts`)
Never access `process.env` directly in application code. All environment variables are validated at build and runtime via `@t3-oss/env-nextjs` and `zod` to prevent leaking secret keys to the client bundle:

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32),
    PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
    FLUTTERWAVE_SECRET_KEY: z.string().min(10),
    FLUTTERWAVE_WEBHOOK_SECRET_HASH: z.string().min(16),
    RESEND_API_KEY: z.string().startsWith('re_'),
    S3_ENDPOINT: z.string().url(),
    S3_ACCESS_KEY_ID: z.string().min(10),
    S3_SECRET_ACCESS_KEY: z.string().min(10),
    S3_BUCKET_NAME: z.string().min(3),
    CRON_SECRET: z.string().min(16),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('https://lifestyleng.com'),
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().startsWith('pk_'),
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY: z.string().optional(),
    NEXT_PUBLIC_WHATSAPP_PRIMARY: z.string().default('2348064912969'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
    FLUTTERWAVE_WEBHOOK_SECRET_HASH: process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY,
    NEXT_PUBLIC_WHATSAPP_PRIMARY: process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY,
  },
});
```

---

## 2. Local Development Tooling (`docker-compose.yml`)
Provide a reproducible local PostgreSQL 16 environment for Antigravity IDE verification:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: lifestyleng_db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: lifestyleng
      POSTGRES_PASSWORD: local_dev_password
      POSTGRES_DB: lifestyleng_core
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

---

## 3. Domain, SSL, Backups & Zero-Downtime Deployment Protocol
In accordance with Sections 8G, 10, and 11 of the project brief:
1. **Domain Ownership & SSL (`LifestyleNG.com`):**
   - Domain and hosting accounts are registered under **Lifestyle Corporate Networks Ltd.'s** direct ownership.
   - Enforce strict HTTPS/TLS 1.3 with HSTS headers (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
2. **Forward-Compatible Database Migrations:**
   - Run `pnpm drizzle-kit migrate` prior to switching container traffic. Never drop or rename active columns in a single deployment step; use expand-and-contract migrations.
3. **Automated Daily Backups:**
   - Configure automated daily encrypted `pg_dump` snapshots pushed to an isolated S3/R2 backup bucket with a 30-day retention policy.
4. **Local SEO & Structured Data (JSON-LD):**
   - Inject `Organization`, `LocalBusiness` (Suite 83 / Block B70, H&A Plaza, Wuye, Abuja), `LodgingBusiness` (Prince & Princess Estate, Kaura District, Abuja), and `Product` schema markup targeting all required Abuja search keywords.

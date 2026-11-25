import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z
      .string()
      .url()
      .default(
        'postgresql://lifestyleng:local_dev_password@localhost:5432/lifestyleng_core'
      ),
    SESSION_SECRET: z
      .string()
      .min(32)
      .default('lifestyleng_local_development_session_secret_key_32chars'),
    ADMIN_EMAIL: z.string().email().default('admin@lifestyleng.com'),
    ADMIN_PASSWORD: z.string().optional(),
    ADMIN_PASSWORD_HASH: z.string().optional(),
    PAYSTACK_SECRET_KEY: z
      .string()
      .startsWith('sk_')
      .default('sk_test_lifestyleng_placeholder_key'),
    FLUTTERWAVE_SECRET_KEY: z
      .string()
      .min(10)
      .default('FLWSECK_TEST_lifestyleng_placeholder'),
    FLUTTERWAVE_WEBHOOK_SECRET_HASH: z
      .string()
      .min(16)
      .default('lifestyleng_flw_webhook_secret_hash_2026'),
    RESEND_API_KEY: z
      .string()
      .startsWith('re_')
      .default('re_test_lifestyleng_placeholder'),
    S3_ENDPOINT: z
      .string()
      .url()
      .default('https://s3.eu-west-1.amazonaws.com'),
    S3_ACCESS_KEY_ID: z
      .string()
      .min(10)
      .default('AKIAIOSFODNN7EXAMPLE'),
    S3_SECRET_ACCESS_KEY: z
      .string()
      .min(10)
      .default('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'),
    S3_BUCKET_NAME: z.string().min(3).default('lifestyleng-media'),
    CRON_SECRET: z
      .string()
      .min(16)
      .default('lifestyleng_cron_sweeper_secret_2026'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .default('https://lifestyleng.com'),
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z
      .string()
      .startsWith('pk_')
      .default('pk_test_lifestyleng_placeholder_key'),
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY: z.string().optional(),
    NEXT_PUBLIC_WHATSAPP_PRIMARY: z.string().default('2348064912969'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
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
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY,
    NEXT_PUBLIC_WHATSAPP_PRIMARY: process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY,
  },
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://lifestyleng:local_dev_password@localhost:5432/lifestyleng_core',
  },
  verbose: true,
  strict: true,
});

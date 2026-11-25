import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export interface VerifiedAdminIdentity {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export function hashPasswordScrypt(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyScryptHash(
  plainPassword: string,
  storedHash: string
): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;

  try {
    const storedKey = Buffer.from(keyHex, 'hex');
    const derivedKey = crypto.scryptSync(plainPassword, salt, storedKey.length);
    if (storedKey.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(storedKey, derivedKey);
  } catch {
    return false;
  }
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function isRealPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  if (
    url ===
    'postgresql://lifestyleng:local_dev_password@localhost:5432/lifestyleng_core'
  ) {
    return false;
  }
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}

export function isUsingLocalDevFallbackCredentials(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    !process.env.ADMIN_PASSWORD_HASH?.trim() &&
    !process.env.ADMIN_PASSWORD?.trim()
  );
}

export async function verifyAdminCredentials(params: {
  email: string;
  password: string;
}): Promise<
  | { ok: true; admin: VerifiedAdminIdentity }
  | { ok: false; code: 'INVALID_CREDENTIALS' | 'ADMIN_NOT_CONFIGURED' }
> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const submittedPassword = params.password;

  // 1. Check PostgreSQL `users` table first if a real managed PostgreSQL database is connected
  if (isRealPostgresConfigured()) {
    try {
      const [dbUser] = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          passwordHash: users.passwordHash,
        })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (
        dbUser &&
        (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN') &&
        dbUser.passwordHash &&
        verifyScryptHash(submittedPassword, dbUser.passwordHash)
      ) {
        return {
          ok: true,
          admin: {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
          },
        };
      }
    } catch {
      // Fall through to env-configured admin credentials if DB table isn't seeded yet
    }
  }

  // 2. Check environment-configured admin credentials (Hostinger hPanel Environment Variables)
  const configuredEmail = (
    process.env.ADMIN_EMAIL?.trim() || 'admin@lifestyleng.com'
  ).toLowerCase();
  const configuredHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const configuredPlain = process.env.ADMIN_PASSWORD?.trim();

  if (configuredHash) {
    if (
      timingSafeStringEqual(normalizedEmail, configuredEmail) &&
      verifyScryptHash(submittedPassword, configuredHash)
    ) {
      return {
        ok: true,
        admin: {
          id: 'env-super-admin',
          email: configuredEmail,
          role: 'SUPER_ADMIN',
        },
      };
    }
    return { ok: false, code: 'INVALID_CREDENTIALS' };
  }

  if (configuredPlain) {
    if (
      timingSafeStringEqual(normalizedEmail, configuredEmail) &&
      timingSafeStringEqual(submittedPassword, configuredPlain)
    ) {
      return {
        ok: true,
        admin: {
          id: 'env-super-admin',
          email: configuredEmail,
          role: 'SUPER_ADMIN',
        },
      };
    }
    return { ok: false, code: 'INVALID_CREDENTIALS' };
  }

  // 3. Fail closed in production — never allow a default password on live servers
  if (process.env.NODE_ENV === 'production') {
    return { ok: false, code: 'ADMIN_NOT_CONFIGURED' };
  }

  // 4. Local development fallback only when NODE_ENV !== 'production'
  if (
    timingSafeStringEqual(normalizedEmail, configuredEmail) &&
    timingSafeStringEqual(submittedPassword, 'LifestyleAdmin2026!')
  ) {
    return {
      ok: true,
      admin: {
        id: 'local-dev-admin',
        email: configuredEmail,
        role: 'SUPER_ADMIN',
      },
    };
  }

  return { ok: false, code: 'INVALID_CREDENTIALS' };
}

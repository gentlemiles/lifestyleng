import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifySessionToken,
  type AdminSessionPayload,
} from './session';

let testBypassEnabled = false;

/**
 * Strictly for unit/integration test runners invoking Server Actions outside
 * a Next.js HTTP cookie context. Ignored outside Vitest test environments.
 */
export function setTestAdminSessionOverride(enabled: boolean): void {
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
    testBypassEnabled = enabled;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  if (
    testBypassEnabled &&
    (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test')
  ) {
    const now = Math.floor(Date.now() / 1000);
    return {
      sub: 'vitest-admin',
      email: 'admin@lifestyleng.com',
      role: 'SUPER_ADMIN',
      iat: now,
      exp: now + 3600,
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('ERR_UNAUTHORIZED');
  }
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    throw new Error('ERR_FORBIDDEN');
  }
  return session;
}

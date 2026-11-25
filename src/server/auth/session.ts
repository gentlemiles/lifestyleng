import crypto from 'node:crypto';
import { env } from '@/env';
import type { UserRole } from '@/types';

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  exp: number;
}

export function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  ttlSeconds: number = 60 * 60 * 24 * 7
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', env.SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

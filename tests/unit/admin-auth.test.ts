import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
} from '@/server/auth/session';
import {
  hashPasswordScrypt,
  verifyScryptHash,
} from '@/server/auth/password';

describe('Admin Session Tokens & Password Hashing', () => {
  it('signs and verifies a valid HMAC-SHA256 admin session token', async () => {
    const token = await createSessionToken({
      sub: 'admin-1',
      email: 'admin@lifestyleng.com',
      role: 'SUPER_ADMIN',
      ttlSeconds: 3600,
    });

    const payload = await verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('admin@lifestyleng.com');
    expect(payload?.role).toBe('SUPER_ADMIN');
  });

  it('rejects tampered or expired session tokens', async () => {
    const token = await createSessionToken({
      sub: 'admin-1',
      email: 'admin@lifestyleng.com',
      role: 'ADMIN',
      ttlSeconds: 3600,
    });
    const tampered = `${token.slice(0, -4)}AAAA`;
    expect(await verifySessionToken(tampered)).toBeNull();

    const expired = await createSessionToken({
      sub: 'admin-1',
      email: 'admin@lifestyleng.com',
      role: 'ADMIN',
      ttlSeconds: -10,
    });
    expect(await verifySessionToken(expired)).toBeNull();
  });

  it('hashes and verifies admin passwords with scrypt timing-safe equality', () => {
    const hash = hashPasswordScrypt('StrongLCN#2026');
    expect(hash).toContain(':');
    expect(verifyScryptHash('StrongLCN#2026', hash)).toBe(true);
    expect(verifyScryptHash('WrongPassword', hash)).toBe(false);
    expect(verifyScryptHash('StrongLCN#2026', 'malformed-hash')).toBe(false);
  });
});

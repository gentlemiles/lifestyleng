export const ADMIN_SESSION_COOKIE_NAME = 'lifestyleng_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AdminSessionPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  iat: number;
  exp: number;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

const DEV_FALLBACK_SESSION_SECRET =
  'lifestyleng_local_development_session_secret_key_32chars';

function getSessionSecret(): string | null {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured && configured.length >= 32) {
    if (
      process.env.NODE_ENV === 'production' &&
      (configured === DEV_FALLBACK_SESSION_SECRET ||
        configured.toLowerCase().includes('replace_with_32'))
    ) {
      return null;
    }
    return configured;
  }
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return DEV_FALLBACK_SESSION_SECRET;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(params: {
  sub: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  ttlSeconds?: number;
}): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('SESSION_SECRET_NOT_CONFIGURED');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: params.sub,
    email: params.email,
    role: params.role,
    iat: nowSec,
    exp: nowSec + (params.ttlSeconds ?? ADMIN_SESSION_TTL_SECONDS),
  };

  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadB64 = toBase64Url(payloadBytes);
  const key = await importHmacKey(secret);
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadB64)
  );
  const sigB64 = toBase64Url(new Uint8Array(sigBuffer));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) return null;

  try {
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes.buffer as ArrayBuffer,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payloadBytes = fromBase64Url(payloadB64);
    if (!payloadBytes) return null;

    const decoded = JSON.parse(
      new TextDecoder().decode(payloadBytes)
    ) as Partial<AdminSessionPayload>;

    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') ||
      typeof decoded.exp !== 'number'
    ) {
      return null;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (decoded.exp <= nowSec) {
      return null;
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      iat: typeof decoded.iat === 'number' ? decoded.iat : nowSec,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

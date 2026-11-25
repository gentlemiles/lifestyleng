import { cookies } from 'next/headers';
import { verifySessionToken, type SessionPayload } from './session';

export async function getOptionalSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('lifestyleng_session')?.value;
  return token ? await verifySessionToken(token) : null;
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getOptionalSession();
  if (!session) {
    throw new Error('ERR_UNAUTHORIZED');
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    throw new Error('ERR_FORBIDDEN');
  }
  return session;
}

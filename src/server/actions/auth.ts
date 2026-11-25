'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ActionResponse } from '@/lib/validations/contracts';
import { checkRateLimit } from '@/server/services/rate-limit';
import { verifyAdminCredentials } from '@/server/auth/password';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
} from '@/server/auth/session';

const adminLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid admin email address.'),
  password: z.string().min(1, 'Password is required.'),
  nextPath: z.string().optional(),
});

function sanitizeNextPath(rawPath: string | undefined): string {
  if (!rawPath) return '/admin';
  const trimmed = rawPath.trim();
  if (
    (trimmed === '/admin' || trimmed.startsWith('/admin/')) &&
    !trimmed.startsWith('/admin/login') &&
    !trimmed.includes('//') &&
    !trimmed.includes('\\')
  ) {
    return trimmed;
  }
  return '/admin';
}

export interface LoginAdminResult {
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  redirectTo: string;
}

export async function loginAdminAction(
  rawInput: unknown
): Promise<ActionResponse<LoginAdminResult>> {
  const rate = checkRateLimit({
    bucketKey: 'admin-login-attempts',
    maxRequests: 8,
    windowMs: 15 * 60 * 1000,
  });

  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: 'ERR_RATE_LIMITED',
        message:
          'Too many sign-in attempts. Please wait 15 minutes before trying again.',
      },
    };
  }

  const parsed = adminLoginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please enter your admin email and password.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const verified = await verifyAdminCredentials({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!verified.ok) {
    if (verified.code === 'ADMIN_NOT_CONFIGURED') {
      return {
        data: null,
        error: {
          code: 'ERR_INTERNAL_SERVER',
          message:
            'Admin credentials are not configured on this server. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD) in your Hostinger environment variables.',
        },
      };
    }

    return {
      data: null,
      error: {
        code: 'ERR_UNAUTHORIZED',
        message: 'Invalid email address or password.',
      },
    };
  }

  let token: string;
  try {
    token = await createSessionToken({
      sub: verified.admin.id,
      email: verified.admin.email,
      role: verified.admin.role,
    });
  } catch {
    return {
      data: null,
      error: {
        code: 'ERR_INTERNAL_SERVER',
        message:
          'SESSION_SECRET is missing or insecure in production. Configure a 32+ character SESSION_SECRET in your Hostinger environment variables.',
      },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return {
    data: {
      email: verified.admin.email,
      role: verified.admin.role,
      redirectTo: sanitizeNextPath(parsed.data.nextPath),
    },
    error: null,
  };
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  redirect('/admin/login');
}

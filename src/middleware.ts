import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/server/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (pathname === '/admin/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    const requested = `${pathname}${search}`;
    if (requested !== '/admin') {
      loginUrl.searchParams.set('next', requested);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

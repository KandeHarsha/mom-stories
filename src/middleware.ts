
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // If the user is on an auth page and has a session, redirect to home
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is on a protected page and has no session, redirect to login
  if (!isAuthPage && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add the pathname to the request headers for use in layouts/pages
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that need to be public for auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * 
     * We exclude /api/auth routes from the auth check here
     * and allow all other /api routes to be checked.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/journal', '/memory-box', '/ai-support', '/health', '/profile', '/settings', '/logout'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Allow root path to be handled by the page's useEffect
  if (pathname === '/') {
    return NextResponse.next();
  }

  // If the user is trying to access a protected route and doesn't have a session cookie,
  // redirect them to the login page.
  if (protectedRoutes.includes(pathname) && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user has a session cookie and is trying to access an authentication route,
  // redirect them to the dashboard.
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

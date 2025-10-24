
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/journal', '/memory-box', '/ai-support', '/health', '/profile', '/settings', '/logout'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/verify'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/';

  console.log('[Middleware]', { pathname, isPublicRoute, isProtectedRoute, hasSession: !!sessionCookie });

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    console.log('[Middleware] Allowing public route:', pathname);
    return NextResponse.next();
  }

  // If the user is trying to access a protected route and doesn't have a session cookie,
  // redirect them to the login page.
  if (isProtectedRoute && !sessionCookie) {
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

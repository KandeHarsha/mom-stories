
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TEMPORARY: Routes allowed during maintenance period
const allowedRoutes = ['/admin', '/login', '/logout', '/verify', '/maintenance'];

const protectedRoutes = ['/dashboard', '/journal', '/memory-box', '/ai-support', '/health', '/profile', '/settings', '/logout'];
const authRoutes = ['/login', '/register'];
const publicRoutes = ['/verify'];
const adminRoutes = ['/admin']; // Admin routes - full role check happens in the page

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TEMPORARY MAINTENANCE MODE: Redirect all routes except allowed ones to /maintenance
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));
  if (!isAllowedRoute) {
    console.log('[Middleware] Maintenance mode - redirecting to /maintenance:', pathname);
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  
  // Check for Better Auth session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token') || 
                        request.cookies.get('session');

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/';
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  console.log('[Middleware]', { 
    pathname, 
    isPublicRoute, 
    isProtectedRoute, 
    isAdminRoute,
    hasSession: !!sessionCookie 
  });

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    console.log('[Middleware] Allowing public route:', pathname);
    return NextResponse.next();
  }

  // Check session for protected and admin routes (cookie-based check)
  // Full authentication and role verification happens in the actual pages
  if (isProtectedRoute || isAdminRoute) {
    if (!sessionCookie) {
      console.log('[Middleware] No session cookie - redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If the user has a session and is trying to access an authentication route,
  // redirect them to maintenance (since dashboard is blocked during maintenance).
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
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

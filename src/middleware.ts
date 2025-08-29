
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/journal', '/memory-box', '/ai-support', '/health', '/profile', '/settings', '/logout'];
const authRoutes = ['/login', '/register'];

// NOTE: This middleware runs on the server and does not have access to localStorage.
// It can only check cookies. The client-side will also need to handle redirects.
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session'); // This might be used for other things, but our token is in localStorage now.
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access the root, redirect to dashboard if "logged in", or login if not.
  // Since we can't check localStorage here, we'll rely on client-side logic to redirect if not logged in.
  // A cookie-based check could be a fallback.
  if (pathname === '/') {
    // This redirect will be caught by the protected route check below if no cookie exists.
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // A user is considered "logged out" on the server if no session cookie exists.
  if (!sessionCookie && isProtectedRoute) {
    // If they try to access a protected route, send them to login.
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // A user is "logged in" on the server if a session cookie exists.
  if (sessionCookie && authRoutes.includes(pathname)) {
    // If they try to access login/register, send them to the dashboard.
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

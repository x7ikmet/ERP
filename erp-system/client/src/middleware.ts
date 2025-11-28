import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/', '/dashboard', '/products', '/customers', '/suppliers', '/sales', '/categories'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  
  // Skip middleware for static assets and API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.') ||
      pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  );
  
  // Check if current route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  console.log(`[Middleware] ${pathname} | token: ${!!token} | protected: ${isProtectedRoute} | auth: ${isAuthRoute}`);

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && token) {
    console.log(`[Middleware] Redirecting from auth route to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    console.log(`[Middleware] Redirecting to login from ${pathname}`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`[Middleware] Allowing request to ${pathname}`);
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
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
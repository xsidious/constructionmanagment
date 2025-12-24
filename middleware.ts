import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isApiAuth = pathname.startsWith('/api/auth');
  const isPublicApi = pathname.startsWith('/api/public') || pathname.startsWith('/api/portfolio/public');
  const isLandingPage = pathname === '/';
  const isPublicPortfolio = pathname.startsWith('/portfolio') && !pathname.startsWith('/portfolio/');
  
  // Allow auth pages, landing page, public portfolio, and API routes
  if (isAuthPage || isApiAuth || isPublicApi || isLandingPage || isPublicPortfolio) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/companies') || 
      pathname.startsWith('/customers') || pathname.startsWith('/projects') ||
      pathname.startsWith('/quotes') || pathname.startsWith('/invoices') ||
      pathname.startsWith('/jobs') || pathname.startsWith('/materials') ||
      pathname.startsWith('/time-tracking') || pathname.startsWith('/equipment') ||
      pathname.startsWith('/expenses') || pathname.startsWith('/subcontractors') ||
      pathname.startsWith('/purchase-orders') || pathname.startsWith('/calendar') ||
      pathname.startsWith('/admin')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


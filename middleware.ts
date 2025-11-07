import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function runs for every request
export async function middleware(request: NextRequest) {
  console.log(`Middleware running for: ${request.nextUrl.pathname}`);
  
  // Skip middleware for non-auth-sensitive paths
  // This includes login pages, API routes, static assets, etc.
  const nonAuthPaths = [
    '/login', 
    '/admin/login', 
    '/', 
    '/api',
    '/_next',
    '/favicon.ico',
    '/images',
    '/debug'
  ];
  
  // Allow access to these paths without authentication checks
  for (const path of nonAuthPaths) {
    if (request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)) {
      console.log(`Skipping middleware for non-auth path: ${request.nextUrl.pathname}`);
      return NextResponse.next();
    }
  }
  
  // If it's a file or static asset, skip middleware
  if (request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // For all protected routes, let the client-side components handle auth
  // This simplifies the middleware and avoids race conditions
  return NextResponse.next();
}

// Configure the middleware to run for specific paths
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 
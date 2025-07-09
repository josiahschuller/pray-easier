import { NextResponse } from 'next/server';

// Middleware temporarily disabled for debugging API routes
export async function middleware() {
  // TODO at some point re-enable this middleware to handle authentication
  // and to handle going back to /auth when not authenticated

  return NextResponse.next();
}

export const config = {
  // Use a matcher that specifically excludes API routes
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static files (e.g. images, js, css, etc.)
     * 4. Favicon, manifest, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.ico).*)'
  ],
};

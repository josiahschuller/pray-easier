import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a response object that we'll modify and return
  const res = NextResponse.next();
  
  // Create a Supabase client configured for use with middleware
  const supabase = createMiddlewareClient({ req: request, res });

  // Get the user's session using the client
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check for access token directly in cookies as a fallback
  const hasAccessToken = request.cookies.has('sb-access-token');
  const hasRefreshToken = request.cookies.has('sb-refresh-token');
  
  // Log debug information more visibly
  console.log('====== MIDDLEWARE DEBUG START ======');
  console.log('Path:', request.nextUrl.pathname);
  console.log('Session from Supabase:', !!session);
  console.log('Has access token cookie:', hasAccessToken);
  console.log('Has refresh token cookie:', hasRefreshToken);
  console.log('User ID (if session exists):', session?.user?.id || 'NO USER');
  console.log('Cookies:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])));
  console.log('====== MIDDLEWARE DEBUG END ======');

  // Now implement proper routing logic
  // Define public routes that don't require authentication
  const isPublicRoute = request.nextUrl.pathname.startsWith('/auth');
  const isAuthenticated = !!session || (hasAccessToken && hasRefreshToken);
  
  // Only for dashboard route - check for session
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      console.log('⚠️ No authentication found, redirecting to /auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    } else {
      console.log('✅ Authentication found for dashboard, allowing access');
    }
  }
  
  // If authenticated user tries to access auth page, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    console.log('✅ User is logged in, redirecting from auth to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other cases, return the response with any cookie changes
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
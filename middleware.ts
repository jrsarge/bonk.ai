import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-key');
const SESSION_COOKIE_NAME = 'bonk-session';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect authenticated users away
const authRoutes = ['/connect'];

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!token) {
      return false;
    }

    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = await isAuthenticated(request);

  // Skip middleware for API routes (except protected ones), static files, and Next.js internals
  if (
    pathname.startsWith('/api/auth') || // Allow auth routes
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Protect API routes that require authentication
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // Redirect authenticated users away from auth routes
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect dashboard and other protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
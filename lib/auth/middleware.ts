import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './session';

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Redirect to home page for UI routes
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return null; // Continue with request
}

export async function redirectIfAuthenticated(request: NextRequest) {
  const session = await getSession();
  
  if (session) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return null; // Continue with request
}
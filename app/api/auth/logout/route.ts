import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Clear session and cookies
    await destroySession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still return success since we want to clear the session regardless
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Clear session and cookies
    await destroySession();
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still redirect to home since we want to clear the session regardless
    return NextResponse.redirect(new URL('/', request.url));
  }
}
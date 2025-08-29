import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/api/strava';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Generate secure state parameter for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in HTTP-only cookie for verification
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Get authorization URL from Strava
    const authUrl = stravaClient.getAuthorizationUrl(state);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
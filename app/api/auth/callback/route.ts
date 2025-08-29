import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { stravaClient } from '@/lib/api/strava';
import { createUser } from '@/lib/db/queries';
import { createSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/?error=oauth_denied&message=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        new URL('/?error=oauth_invalid&message=Missing authorization code or state', request.url)
      );
    }

    // Verify state parameter for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!storedState || storedState !== state) {
      console.error('State mismatch:', { stored: storedState, received: state });
      return NextResponse.redirect(
        new URL('/?error=oauth_invalid&message=Invalid state parameter', request.url)
      );
    }

    // Clear state cookie
    cookieStore.delete('oauth_state');

    // Exchange code for tokens
    const tokenResponse = await stravaClient.exchangeCodeForTokens(code);
    
    // Get athlete information
    const athlete = tokenResponse.athlete;

    // Create or update user in database
    const dbUser = await createUser({
      id: athlete.id,
      email: '', // Strava doesn't provide email in OAuth response
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile,
    });

    // Create session
    await createSession(
      dbUser.id,
      athlete.id,
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_at
    );

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    return NextResponse.redirect(
      new URL(`/?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
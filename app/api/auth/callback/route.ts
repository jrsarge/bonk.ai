import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { stravaClient } from '@/lib/api/strava';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/?error=oauth_denied&message=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        new URL('/?error=oauth_invalid&message=Missing authorization code or state', request.url)
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!storedState || storedState !== state) {
      console.error('State mismatch:', { stored: storedState, received: state });
      return NextResponse.redirect(
        new URL('/?error=oauth_invalid&message=Invalid state parameter', request.url)
      );
    }

    cookieStore.delete('oauth_state');

    const tokenResponse = await stravaClient.exchangeCodeForTokens(code);
    const athlete = tokenResponse.athlete;

    const successUrl = new URL('/connect', request.url);
    successUrl.searchParams.set('access_token', tokenResponse.access_token);
    successUrl.searchParams.set('athlete', JSON.stringify(athlete));

    return NextResponse.redirect(successUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    return NextResponse.redirect(
      new URL(`/?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
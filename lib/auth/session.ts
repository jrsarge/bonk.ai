import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { kv } from '@vercel/kv';
import { User, Session } from '@/types';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-key');
const SESSION_COOKIE_NAME = 'bonk-session';
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

export interface SessionData {
  userId: string;
  stravaId: number;
  sessionId: string;
}

export async function createSession(
  userId: string,
  stravaId: number,
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expirationTime = Math.floor(Date.now() / 1000) + SESSION_DURATION;

  // Store session data in Redis with encryption
  const sessionData: Session = {
    userId,
    stravaAccessToken: accessToken,
    stravaRefreshToken: refreshToken,
    stravaExpiresAt: expiresAt,
    createdAt: new Date(),
  };

  // Store in KV with expiration
  await kv.setex(`session:${sessionId}`, SESSION_DURATION, JSON.stringify(sessionData));

  // Create JWT token for the cookie
  const token = await new SignJWT({ userId, stravaId, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expirationTime)
    .setIssuedAt()
    .sign(JWT_SECRET);

  // Set secure HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return sessionId;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // Verify and decode JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sessionData = payload as unknown as SessionData;

    // Check if session exists in KV
    const kvData = await kv.get(`session:${sessionData.sessionId}`);
    if (!kvData) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function getSessionWithTokens(): Promise<(SessionData & Session) | null> {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return null;
    }

    // Get full session data from KV
    const kvDataString = await kv.get(`session:${sessionData.sessionId}`);
    if (!kvDataString || typeof kvDataString !== 'string') {
      return null;
    }

    const sessionTokens = JSON.parse(kvDataString) as Session;
    
    return {
      ...sessionData,
      ...sessionTokens,
    };
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

export async function updateSessionTokens(
  sessionId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> {
  try {
    // Get existing session data
    const existingDataString = await kv.get(`session:${sessionId}`);
    if (!existingDataString || typeof existingDataString !== 'string') {
      throw new Error('Session not found');
    }

    const existingData = JSON.parse(existingDataString) as Session;

    // Update tokens
    const updatedData: Session = {
      ...existingData,
      stravaAccessToken: accessToken,
      stravaRefreshToken: refreshToken,
      stravaExpiresAt: expiresAt,
    };

    // Update in KV with same TTL
    await kv.setex(`session:${sessionId}`, SESSION_DURATION, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Token update error:', error);
    throw error;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const sessionData = await getSession();
    
    if (sessionData) {
      // Remove from KV
      await kv.del(`session:${sessionData.sessionId}`);
    }

    // Clear cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Session destruction error:', error);
    // Continue with cookie deletion even if KV deletion fails
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function refreshStravaToken(sessionId: string): Promise<boolean> {
  try {
    const { stravaClient } = await import('@/lib/api/strava');
    const sessionDataString = await kv.get(`session:${sessionId}`);
    
    if (!sessionDataString || typeof sessionDataString !== 'string') {
      return false;
    }

    const sessionData = JSON.parse(sessionDataString) as Session;
    
    // Check if token needs refresh (refresh if expires in next 10 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (sessionData.stravaExpiresAt > now + 600) {
      return true; // Token is still valid
    }

    // Refresh the token
    const tokenResponse = await stravaClient.refreshAccessToken(sessionData.stravaRefreshToken);
    
    // Update session with new tokens
    await updateSessionTokens(
      sessionId,
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_at
    );

    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}
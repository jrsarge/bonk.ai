import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithTokens } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionWithTokens();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile data
    return NextResponse.json({
      id: user.id,
      stravaId: user.strava_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
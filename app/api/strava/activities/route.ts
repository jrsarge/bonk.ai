import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/api/strava';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, weeks = 12 } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const activities = await stravaClient.getRecentRunningActivities(accessToken, weeks);
    
    return NextResponse.json({ activities });
    
  } catch (error) {
    console.error('Strava activities fetch error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch activities';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
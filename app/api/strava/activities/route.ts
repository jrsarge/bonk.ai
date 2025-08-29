import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/api/strava';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const text = await request.text();
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

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
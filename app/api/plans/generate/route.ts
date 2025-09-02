import { NextRequest, NextResponse } from 'next/server';
import { TrainingPlan, PlanGenerationRequest, PlanGenerationResponse } from '@/types';
import { anthropicClient } from '@/lib/api/anthropic';
import { TrainingAnalyzer } from '@/lib/training/analysis';
import { StravaActivity } from '@/types/strava';
import { planGenerationLimiter, getClientIP } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit first
    const clientIP = getClientIP(request);
    const rateLimitResult = planGenerationLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime || Date.now() + 24 * 60 * 60 * 1000;
      const hoursUntilReset = Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60));
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. You can only generate 1 training plan per day.',
          resetIn: `${hoursUntilReset} hours`
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '1',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
          }
        }
      );
    }
    
    const body = await request.json();
    const { 
      raceDistance, 
      targetTime, 
      stravaActivities,
      trainingDays = 5,
      experience = 'intermediate',
      currentMileage,
      datePreferences,
      preferences
    } = body as {
      raceDistance: '5k' | '10k' | 'half' | 'marathon' | '50k' | '50mile' | '100k' | '100mile';
      targetTime?: string;
      stravaActivities?: StravaActivity[];
      trainingDays?: number;
      experience?: 'beginner' | 'intermediate' | 'advanced';
      currentMileage?: number;
      datePreferences?: {
        mode: 'auto' | 'start' | 'end';
        startDate?: string;
        endDate?: string;
      };
      preferences?: {
        preferredWorkoutDays?: number[];
        maxLongRunDistance?: number;
        includeSpeedWork?: boolean;
      };
    };

    // Validate required fields
    if (!raceDistance) {
      return NextResponse.json(
        { error: 'Race distance is required' },
        { status: 400 }
      );
    }

    const validDistances = ['5k', '10k', 'half', 'marathon', '50k', '50mile', '100k', '100mile'];
    if (!validDistances.includes(raceDistance)) {
      return NextResponse.json(
        { error: 'Invalid race distance' },
        { status: 400 }
      );
    }

    // Analyze Strava data if provided
    let stravaAnalysis = undefined;
    if (stravaActivities && stravaActivities.length > 0) {
      const analyzer = new TrainingAnalyzer(stravaActivities);
      const analysis = analyzer.analyze();
      
      stravaAnalysis = {
        weeklyMileage: analysis.totalDistance / 12, // Average weekly mileage over 12 weeks
        averagePace: analysis.averagePace,
        longestRun: analysis.longestRun,
        runFrequency: analysis.runFrequency,
        fitnessScore: analysis.fitnessScore,
        paceDistribution: analysis.paceDistribution.map(zone => ({
          zone: zone.zone,
          percentage: zone.percentage,
          minPace: zone.minPace,
          maxPace: zone.maxPace
        }))
      };
    }

    // Build request for AI generation
    const generationRequest: PlanGenerationRequest = {
      raceDistance,
      targetTime,
      trainingDays,
      currentMileage: currentMileage || stravaAnalysis?.weeklyMileage || 20,
      experience,
      preferences
    };

    // Generate plan using AI
    const aiPlan = await anthropicClient.generateTrainingPlan({
      raceDistance,
      targetTime,
      stravaAnalysis,
      datePreferences,
      preferences: {
        trainingDays,
        experience,
        currentMileage: generationRequest.currentMileage
      }
    });

    // Create the final training plan object
    const planId = crypto.randomUUID();
    const plan: TrainingPlan = {
      id: planId,
      userId: 'anonymous', // TODO: Replace with actual user ID from session
      raceDistance,
      targetTime,
      weeks: aiPlan.weeks.map(week => ({
        ...week,
        weekNumber: week.weekNumber,
        startDate: week.startDate,
        theme: week.theme,
        description: week.description,
        totalDistance: week.totalDistance,
        keyWorkout: week.keyWorkout,
        workouts: week.workouts
      })),
      generatedAt: new Date().toISOString(),
      parameters: generationRequest,
      summary: aiPlan.summary
    };

    const response: PlanGenerationResponse = {
      success: true,
      plan
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Plan generation error:', error);
    
    const response: PlanGenerationResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate training plan'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
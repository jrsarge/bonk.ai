import { NextRequest, NextResponse } from 'next/server';
import { RaceDistance, TrainingPlan } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raceDistance, targetTime, stravaActivities } = body as {
      raceDistance: RaceDistance;
      targetTime?: string;
      stravaActivities?: object[];
    };

    if (!raceDistance) {
      return NextResponse.json(
        { error: 'Race distance is required' },
        { status: 400 }
      );
    }

    const planId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const plan: TrainingPlan = {
      id: planId,
      raceDistance,
      targetTime,
      createdAt,
      planData: generateBasicPlan(raceDistance, targetTime, stravaActivities),
    };

    return NextResponse.json({ plan });
    
  } catch (error) {
    console.error('Plan generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate training plan' },
      { status: 500 }
    );
  }
}

function generateBasicPlan(raceDistance: RaceDistance, targetTime?: string, _activities?: object[]) {
  const getWeeksForDistance = (distance: RaceDistance) => {
    switch (distance) {
      case '5k': return 8;
      case '10k': return 10;
      case 'half_marathon': return 12;
      case 'marathon': return 16;
      default: return 12;
    }
  };

  const totalWeeks = getWeeksForDistance(raceDistance);
  const weeks = [];
  
  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const isRecoveryWeek = weekNum % 4 === 0;
    const weekDistance = calculateWeekDistance(raceDistance, weekNum, totalWeeks, isRecoveryWeek);
    
    weeks.push({
      weekNumber: weekNum,
      theme: getWeekTheme(weekNum, totalWeeks, isRecoveryWeek),
      totalDistance: weekDistance,
      workouts: generateWeekWorkouts(weekDistance, raceDistance, weekNum, totalWeeks)
    });
  }

  return {
    weeks,
    summary: {
      totalWeeks,
      peakWeeklyMileage: Math.max(...weeks.map(w => w.totalDistance)),
      description: `${totalWeeks}-week training plan for ${raceDistance}${targetTime ? ` with target time of ${targetTime}` : ''}`,
    }
  };
}

function calculateWeekDistance(raceDistance: RaceDistance, weekNum: number, totalWeeks: number, isRecoveryWeek: boolean) {
  const baseDistances = {
    '5k': { start: 15, peak: 25 },
    '10k': { start: 20, peak: 35 },
    'half_marathon': { start: 25, peak: 45 },
    'marathon': { start: 30, peak: 60 }
  };

  const { start, peak } = baseDistances[raceDistance];
  const buildPhase = Math.floor(totalWeeks * 0.7);
  
  if (weekNum <= buildPhase) {
    const progress = weekNum / buildPhase;
    const distance = start + (peak - start) * progress;
    return isRecoveryWeek ? distance * 0.7 : distance;
  } else {
    const taperPhase = (weekNum - buildPhase) / (totalWeeks - buildPhase);
    const distance = peak - (peak - start * 0.8) * taperPhase;
    return Math.max(distance, start * 0.6);
  }
}

function getWeekTheme(weekNum: number, totalWeeks: number, isRecoveryWeek: boolean) {
  if (isRecoveryWeek) return 'Recovery Week';
  if (weekNum <= 2) return 'Base Building';
  if (weekNum <= Math.floor(totalWeeks * 0.6)) return 'Aerobic Development';
  if (weekNum <= Math.floor(totalWeeks * 0.8)) return 'Peak Training';
  return 'Race Preparation';
}

function generateWeekWorkouts(weekDistance: number, raceDistance: RaceDistance, weekNum: number, totalWeeks: number) {
  const longRunDistance = Math.min(weekDistance * 0.4, raceDistance === 'marathon' ? 20 : 13);
  const easyRunDistance = (weekDistance - longRunDistance) / 4;
  
  const workouts = [
    {
      day: 1,
      type: 'easy' as const,
      distance: easyRunDistance,
      description: `Easy ${easyRunDistance.toFixed(1)} miles`,
      pace: 'Conversational pace'
    },
    {
      day: 2,
      type: 'rest' as const,
      description: 'Rest day or light cross-training'
    },
    {
      day: 3,
      type: weekNum > 2 && weekNum < totalWeeks - 2 ? 'tempo' as const : 'easy' as const,
      distance: easyRunDistance,
      description: weekNum > 2 && weekNum < totalWeeks - 2 
        ? `Tempo run: ${easyRunDistance.toFixed(1)} miles`
        : `Easy ${easyRunDistance.toFixed(1)} miles`,
      pace: weekNum > 2 && weekNum < totalWeeks - 2 ? 'Comfortably hard' : 'Easy pace'
    },
    {
      day: 4,
      type: 'rest' as const,
      description: 'Rest day'
    },
    {
      day: 5,
      type: 'easy' as const,
      distance: easyRunDistance,
      description: `Easy ${easyRunDistance.toFixed(1)} miles`,
      pace: 'Easy pace'
    },
    {
      day: 6,
      type: 'long' as const,
      distance: longRunDistance,
      description: `Long run: ${longRunDistance.toFixed(1)} miles`,
      pace: 'Easy to moderate pace'
    },
    {
      day: 7,
      type: 'rest' as const,
      description: 'Rest day or easy walk'
    }
  ];

  return workouts;
}
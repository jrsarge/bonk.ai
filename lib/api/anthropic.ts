import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface PlanGenerationPromptData {
  raceDistance: '5k' | '10k' | 'half' | 'marathon';
  targetTime?: string;
  stravaAnalysis?: {
    weeklyMileage: number;
    averagePace: number;
    longestRun: number;
    runFrequency: number;
    fitnessScore: number;
    paceDistribution: Array<{
      zone: string;
      percentage: number;
      minPace: number;
      maxPace: number;
    }>;
  };
  preferences?: {
    trainingDays?: number;
    experience?: 'beginner' | 'intermediate' | 'advanced';
    currentMileage?: number;
  };
}

export interface AIGeneratedPlan {
  weeks: Array<{
    weekNumber: number;
    startDate: string;
    theme: string;
    description: string;
    totalDistance: number;
    keyWorkout?: string;
    workouts: Array<{
      day: number;
      date: string;
      type: 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'cross' | 'race';
      name: string;
      description: string;
      distance?: number;
      duration?: number;
      targetPace?: string;
      effortLevel: 1 | 2 | 3 | 4 | 5;
      notes?: string;
    }>;
  }>;
  summary: {
    totalWeeks: number;
    peakWeeklyMileage: number;
    description: string;
    paceRecommendations: {
      easy: string;
      tempo: string;
      interval: string;
      long: string;
    };
  };
}

export class AnthropicClient {
  private client: Anthropic;

  constructor() {
    this.client = anthropic;
  }

  async generateTrainingPlan(data: PlanGenerationPromptData): Promise<AIGeneratedPlan> {
    const prompt = this.buildPrompt(data);
    
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 16000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude');
      }

      const planData = this.parseResponse(content.text);
      return this.validateAndFormatPlan(planData, data);
      
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to generate training plan with AI');
    }
  }

  private buildPrompt(data: PlanGenerationPromptData): string {
    const { raceDistance, targetTime, stravaAnalysis, preferences } = data;
    
    return `You are an expert running coach creating a personalized 12-week training plan. Generate a comprehensive training plan in JSON format.

ATHLETE DATA:
- Race Distance: ${raceDistance}
${targetTime ? `- Target Time: ${targetTime}` : ''}
${stravaAnalysis ? `
- Current Weekly Mileage: ${stravaAnalysis.weeklyMileage.toFixed(1)} miles
- Average Pace: ${this.formatPace(stravaAnalysis.averagePace)}
- Longest Run: ${stravaAnalysis.longestRun.toFixed(1)} miles  
- Run Frequency: ${stravaAnalysis.runFrequency.toFixed(1)} runs/week
- Fitness Score: ${stravaAnalysis.fitnessScore}/100
- Pace Distribution: ${stravaAnalysis.paceDistribution.map(z => `${z.zone}: ${z.percentage.toFixed(1)}%`).join(', ')}
` : ''}
${preferences ? `
- Training Days: ${preferences.trainingDays || 4-5} days/week
- Experience: ${preferences.experience || 'intermediate'}
- Current Mileage: ${preferences.currentMileage || 'unknown'} miles/week
` : ''}

TRAINING PLAN REQUIREMENTS:
1. Exactly 12 weeks with proper periodization
2. Include base building, peak training, and taper phases
3. Progressive weekly mileage with appropriate recovery weeks (every 4th week)
4. Race-specific workouts based on distance:
   - 5K: Speed/VO2max focus, intervals, tempo runs
   - 10K: Speed + aerobic balance, threshold work  
   - Half Marathon: Tempo emphasis, progressive long runs
   - Marathon: Aerobic base, long runs up to 20+ miles
5. Realistic pace recommendations based on current fitness
6. Include rest days and cross-training options
7. Injury prevention focus - don't increase mileage too aggressively

PACE ZONES (estimate based on current data):
${stravaAnalysis ? `
- Easy Pace: ${this.calculatePaceZone(stravaAnalysis.averagePace, 'easy')}
- Tempo Pace: ${this.calculatePaceZone(stravaAnalysis.averagePace, 'tempo')}
- Interval Pace: ${this.calculatePaceZone(stravaAnalysis.averagePace, 'interval')}
- Long Run Pace: ${this.calculatePaceZone(stravaAnalysis.averagePace, 'long')}
` : 'Use standard pace zone calculations based on target race time'}

Return ONLY valid JSON in this exact format:
{
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2024-01-01",
      "theme": "Base Building",
      "description": "Focus on building aerobic base with easy miles",
      "totalDistance": 25,
      "keyWorkout": "4-mile tempo run",
      "workouts": [
        {
          "day": 1,
          "date": "2024-01-01", 
          "type": "easy",
          "name": "Easy Run",
          "description": "4 miles at conversational pace",
          "distance": 4,
          "targetPace": "8:30-9:00",
          "effortLevel": 2,
          "notes": "Focus on form and relaxation"
        }
      ]
    }
  ],
  "summary": {
    "totalWeeks": 12,
    "peakWeeklyMileage": 45,
    "description": "Progressive 12-week plan building toward ${raceDistance} race",
    "paceRecommendations": {
      "easy": "8:30-9:00",
      "tempo": "7:45-8:00", 
      "interval": "7:15-7:30",
      "long": "8:15-8:45"
    }
  }
}

IMPORTANT: Return only the JSON object, no additional text or formatting.`;
  }

  private parseResponse(response: string): unknown {
    try {
      // Clean the response to extract JSON
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = response.slice(jsonStart, jsonEnd);
      
      // Check for potential truncation by looking for incomplete JSON structure
      const openBraces = (jsonStr.match(/\{/g) || []).length;
      const closeBraces = (jsonStr.match(/\}/g) || []).length;
      const openBrackets = (jsonStr.match(/\[/g) || []).length;
      const closeBrackets = (jsonStr.match(/\]/g) || []).length;
      
      if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.error('JSON structure mismatch detected:', {
          openBraces,
          closeBraces,
          openBrackets,
          closeBrackets,
          responseLength: response.length,
          jsonLength: jsonStr.length
        });
        throw new Error(`Response appears to be truncated - mismatched JSON brackets (braces: ${openBraces}/${closeBraces}, brackets: ${openBrackets}/${closeBrackets})`);
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Additional validation to ensure we have a complete plan structure
      if (!parsed.weeks || !Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
        throw new Error('Response missing required weeks data');
      }
      
      // Check if we have fewer than expected weeks, which might indicate truncation
      if (parsed.weeks.length < 12) {
        console.warn(`Training plan only has ${parsed.weeks.length} weeks instead of expected 12`);
      }
      
      return parsed;
    } catch (error) {
      console.error('Error parsing Claude response (first 500 chars):', response.substring(0, 500));
      console.error('Error parsing Claude response (last 500 chars):', response.substring(Math.max(0, response.length - 500)));
      console.error('Parse error details:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to parse training plan: ${error.message}`);
      }
      throw new Error('Failed to parse training plan from AI response');
    }
  }

  private validateAndFormatPlan(plan: unknown, originalData: PlanGenerationPromptData): AIGeneratedPlan {
    // Type guard to check if plan has expected structure
    const planData = plan as Record<string, unknown>;
    
    // Basic validation
    if (!planData.weeks || !Array.isArray(planData.weeks)) {
      throw new Error('Invalid plan format: missing weeks array');
    }

    if (planData.weeks.length !== 12) {
      throw new Error('Plan must be exactly 12 weeks');
    }

    // Ensure all required fields are present and properly formatted
    const validatedPlan: AIGeneratedPlan = {
      weeks: planData.weeks.map((week: unknown, index: number) => {
        const weekData = week as Record<string, unknown>;
        return {
          weekNumber: index + 1,
          startDate: (weekData.startDate as string) || new Date().toISOString().split('T')[0],
          theme: (weekData.theme as string) || 'Training Week',
          description: (weekData.description as string) || '',
          totalDistance: Math.max((weekData.totalDistance as number) || 0, 0),
          keyWorkout: weekData.keyWorkout as string | undefined,
          workouts: Array.isArray(weekData.workouts) ? weekData.workouts.map((workout: unknown) => {
            const workoutData = workout as Record<string, unknown>;
            return {
              day: (workoutData.day as number) || 1,
              date: (workoutData.date as string) || (weekData.startDate as string),
              type: this.validateWorkoutType(workoutData.type),
              name: (workoutData.name as string) || 'Workout',
              description: (workoutData.description as string) || '',
              distance: workoutData.distance ? Math.max(workoutData.distance as number, 0) : undefined,
              duration: workoutData.duration ? Math.max(workoutData.duration as number, 0) : undefined,
              targetPace: workoutData.targetPace as string | undefined,
              effortLevel: Math.min(Math.max((workoutData.effortLevel as number) || 3, 1), 5) as 1|2|3|4|5,
              notes: workoutData.notes as string | undefined
            };
          }) : []
        };
      }),
      summary: {
        totalWeeks: 12,
        peakWeeklyMileage: (planData.summary as Record<string, unknown>)?.peakWeeklyMileage as number || 0,
        description: (planData.summary as Record<string, unknown>)?.description as string || `12-week ${originalData.raceDistance} training plan`,
        paceRecommendations: ((planData.summary as Record<string, unknown>)?.paceRecommendations as {
          easy: string;
          tempo: string;
          interval: string;
          long: string;
        }) || {
          easy: '8:00-8:30',
          tempo: '7:15-7:30', 
          interval: '6:45-7:00',
          long: '8:15-8:45'
        }
      }
    };

    return validatedPlan;
  }

  private validateWorkoutType(type: unknown): 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'cross' | 'race' {
    const validTypes = ['easy', 'tempo', 'interval', 'long', 'rest', 'cross', 'race'];
    return validTypes.includes(type as string) ? (type as 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'cross' | 'race') : 'easy';
  }

  private formatPace(paceInMinutesPerMile: number): string {
    if (!paceInMinutesPerMile || paceInMinutesPerMile <= 0) return '8:00';
    
    const minutes = Math.floor(paceInMinutesPerMile);
    const seconds = Math.round((paceInMinutesPerMile - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private calculatePaceZone(averagePace: number, zone: 'easy' | 'tempo' | 'interval' | 'long'): string {
    if (!averagePace || averagePace <= 0) {
      const defaultPaces = {
        easy: '8:30-9:00',
        tempo: '7:30-7:45',
        interval: '7:00-7:15',
        long: '8:15-8:45'
      };
      return defaultPaces[zone];
    }

    let adjustment = 0;
    switch (zone) {
      case 'easy':
        adjustment = 1.0; // 1 minute slower
        break;
      case 'tempo': 
        adjustment = -0.5; // 30 seconds faster
        break;
      case 'interval':
        adjustment = -1.0; // 1 minute faster
        break;
      case 'long':
        adjustment = 0.5; // 30 seconds slower
        break;
    }

    const zonePace = averagePace + adjustment;
    const rangeStart = this.formatPace(zonePace - 0.25);
    const rangeEnd = this.formatPace(zonePace + 0.25);
    
    return `${rangeStart}-${rangeEnd}`;
  }
}

export const anthropicClient = new AnthropicClient();
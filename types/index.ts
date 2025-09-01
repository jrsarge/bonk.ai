// Main type definitions for bonk.ai

export interface Activity {
  id: number;
  name: string;
  distance: number; // in meters
  movingTime: number; // in seconds
  elapsedTime: number; // in seconds
  startDate: string;
  type: string;
  averageSpeed: number; // in m/s
  maxSpeed: number; // in m/s
  elevationGain: number; // in meters
}

export interface TrainingAnalysis {
  weeklyMileage: number[];
  averagePace: number; // in seconds per mile
  consistency: number; // percentage
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  recommendedRaceDistance: '5k' | '10k' | 'half' | 'marathon';
}

export type RaceDistance = '5k' | '10k' | 'half' | 'marathon';

export interface TrainingPlan {
  id: string;
  userId: string;
  raceDistance: RaceDistance;
  targetTime?: string;
  customName?: string;
  weeks: TrainingWeek[];
  generatedAt: string;
  parameters: PlanGenerationRequest;
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

export interface TrainingWeek {
  weekNumber: number;
  startDate: string;
  theme: string;
  description: string;
  totalDistance: number;
  keyWorkout?: string;
  workouts: TrainingWorkout[];
}

export interface TrainingWorkout {
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
}

export interface PlanGenerationRequest {
  raceDistance: RaceDistance;
  targetTime?: string;
  trainingDays: number;
  currentMileage: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  preferences?: {
    preferredWorkoutDays?: number[];
    maxLongRunDistance?: number;
    includeSpeedWork?: boolean;
  };
}

export interface PlanGenerationResponse {
  success: boolean;
  plan?: TrainingPlan;
  error?: string;
}

export interface StoredPlan {
  plan: TrainingPlan;
  createdAt: string;
  lastViewed?: string;
}

// Legacy types for backward compatibility
export interface Week {
  weekNumber: number;
  theme: string;
  totalDistance: number;
  workouts: Workout[];
}

export interface Workout {
  day: number;
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'cross';
  distance?: number;
  duration?: number;
  pace?: string;
  description: string;
  notes?: string;
}
// Training plan specific types

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

export interface WorkoutTemplate {
  type: WorkoutType;
  name: string;
  description: string;
  paceGuidance: string;
  minDistance: number;
  maxDistance: number;
  raceDistances: RaceDistance[];
}

export type WorkoutType = 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'cross' | 'race';

export type RaceDistance = '5k' | '10k' | 'half' | 'marathon';

export interface TrainingPlan {
  id: string;
  userId: string;
  raceDistance: RaceDistance;
  targetTime?: string;
  weeks: TrainingWeek[];
  generatedAt: Date;
  parameters: PlanGenerationRequest;
}

export interface TrainingWeek {
  weekNumber: number;
  startDate: Date;
  theme: string;
  description: string;
  totalDistance: number;
  keyWorkout?: string;
  workouts: TrainingWorkout[];
}

export interface TrainingWorkout {
  day: number;
  date: Date;
  type: WorkoutType;
  name: string;
  description: string;
  distance?: number;
  duration?: number;
  targetPace?: string;
  effortLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  completed?: boolean;
}
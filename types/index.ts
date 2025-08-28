// Main type definitions for bonk.ai

export interface User {
  id: string;
  stravaId: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  userId: string;
  stravaAccessToken: string;
  stravaRefreshToken: string;
  stravaExpiresAt: number;
  createdAt: Date;
}

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
  weeks: Week[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Week {
  weekNumber: number;
  theme: string;
  totalDistance: number; // changed from totalMiles to totalDistance for consistency
  workouts: Workout[];
}

export interface Workout {
  day: number;
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'rest' | 'cross';
  distance?: number; // in miles
  duration?: number; // in minutes
  pace?: string; // e.g., "8:30"
  description: string;
  notes?: string;
}
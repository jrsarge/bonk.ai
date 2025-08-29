import { sql } from './connection';
import { User, TrainingPlan, RaceDistance } from '../../types';

export interface DbUser {
  id: string;
  strava_id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbTrainingPlan {
  id: string;
  user_id: string;
  race_distance: RaceDistance;
  target_time: string | null;
  plan_data: object;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(stravaUser: {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  profile?: string;
}): Promise<DbUser> {
  const result = await sql`
    INSERT INTO users (strava_id, email, first_name, last_name, profile_picture_url)
    VALUES (${stravaUser.id}, ${stravaUser.email || null}, ${stravaUser.firstname || null}, ${stravaUser.lastname || null}, ${stravaUser.profile || null})
    ON CONFLICT (strava_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      profile_picture_url = EXCLUDED.profile_picture_url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  return result[0] as DbUser;
}

export async function getUserByStravaId(stravaId: number): Promise<DbUser | null> {
  const result = await sql`
    SELECT * FROM users WHERE strava_id = ${stravaId}
  `;
  
  return result[0] as DbUser || null;
}

export async function getUserById(userId: string): Promise<DbUser | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `;
  
  return result[0] as DbUser || null;
}

export async function createTrainingPlan(plan: {
  userId: string;
  raceDistance: RaceDistance;
  targetTime?: string;
  planData: object;
}): Promise<DbTrainingPlan> {
  const result = await sql`
    INSERT INTO training_plans (user_id, race_distance, target_time, plan_data)
    VALUES (${plan.userId}, ${plan.raceDistance}, ${plan.targetTime || null}, ${JSON.stringify(plan.planData)})
    RETURNING *
  `;
  
  return result[0] as DbTrainingPlan;
}

export async function getTrainingPlanById(planId: string): Promise<DbTrainingPlan | null> {
  const result = await sql`
    SELECT * FROM training_plans WHERE id = ${planId}
  `;
  
  return result[0] as DbTrainingPlan || null;
}

export async function getUserTrainingPlans(userId: string): Promise<DbTrainingPlan[]> {
  const result = await sql`
    SELECT * FROM training_plans 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  
  return result as DbTrainingPlan[];
}

export async function deleteTrainingPlan(planId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM training_plans 
    WHERE id = ${planId} AND user_id = ${userId}
  `;
  
  return result.length > 0;
}
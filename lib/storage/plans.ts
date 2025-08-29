import { TrainingPlan, StoredPlan } from '@/types';

const STORAGE_KEYS = {
  PLANS: 'bonk_training_plans',
  ACTIVE_PLAN: 'bonk_active_plan',
} as const;

export class PlanStorage {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getStorage(): Storage | null {
    return this.isClient() ? window.localStorage : null;
  }

  /**
   * Store a training plan in localStorage
   */
  savePlan(plan: TrainingPlan): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const storedPlan: StoredPlan = {
        plan,
        createdAt: new Date().toISOString(),
        lastViewed: new Date().toISOString()
      };

      const existingPlans = this.getAllPlans();
      const updatedPlans = [...existingPlans.filter(p => p.plan.id !== plan.id), storedPlan];

      // Keep only the 10 most recent plans
      const sortedPlans = updatedPlans
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      storage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(sortedPlans));
    } catch (error) {
      console.error('Failed to save plan to localStorage:', error);
    }
  }

  /**
   * Get all stored training plans
   */
  getAllPlans(): StoredPlan[] {
    const storage = this.getStorage();
    if (!storage) return [];

    try {
      const plansJson = storage.getItem(STORAGE_KEYS.PLANS);
      if (!plansJson) return [];

      const plans = JSON.parse(plansJson) as StoredPlan[];
      return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load plans from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId: string): StoredPlan | null {
    const plans = this.getAllPlans();
    const storedPlan = plans.find(p => p.plan.id === planId) || null;

    if (storedPlan) {
      // Update last viewed timestamp
      this.updateLastViewed(planId);
    }

    return storedPlan;
  }

  /**
   * Delete a plan by ID
   */
  deletePlan(planId: string): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const plans = this.getAllPlans();
      const filteredPlans = plans.filter(p => p.plan.id !== planId);
      storage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(filteredPlans));

      // If deleted plan was the active plan, clear it
      const activePlan = this.getActivePlan();
      if (activePlan && activePlan.id === planId) {
        this.setActivePlan(null);
      }
    } catch (error) {
      console.error('Failed to delete plan from localStorage:', error);
    }
  }

  /**
   * Set the active plan (currently being viewed/followed)
   */
  setActivePlan(plan: TrainingPlan | null): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      if (plan) {
        storage.setItem(STORAGE_KEYS.ACTIVE_PLAN, plan.id);
        this.updateLastViewed(plan.id);
      } else {
        storage.removeItem(STORAGE_KEYS.ACTIVE_PLAN);
      }
    } catch (error) {
      console.error('Failed to set active plan:', error);
    }
  }

  /**
   * Get the currently active plan
   */
  getActivePlan(): TrainingPlan | null {
    const storage = this.getStorage();
    if (!storage) return null;

    try {
      const activePlanId = storage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
      if (!activePlanId) return null;

      const storedPlan = this.getPlan(activePlanId);
      return storedPlan ? storedPlan.plan : null;
    } catch (error) {
      console.error('Failed to get active plan:', error);
      return null;
    }
  }

  /**
   * Update the last viewed timestamp for a plan
   */
  private updateLastViewed(planId: string): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const plans = this.getAllPlans();
      const updatedPlans = plans.map(storedPlan => {
        if (storedPlan.plan.id === planId) {
          return {
            ...storedPlan,
            lastViewed: new Date().toISOString()
          };
        }
        return storedPlan;
      });

      storage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Failed to update last viewed timestamp:', error);
    }
  }

  /**
   * Mark a workout as completed
   */
  markWorkoutCompleted(planId: string, weekNumber: number, workoutDay: number): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const plans = this.getAllPlans();
      const updatedPlans = plans.map(storedPlan => {
        if (storedPlan.plan.id === planId) {
          const updatedWeeks = storedPlan.plan.weeks.map(week => {
            if (week.weekNumber === weekNumber) {
              const updatedWorkouts = week.workouts.map(workout => {
                if (workout.day === workoutDay) {
                  return { ...workout, completed: true };
                }
                return workout;
              });
              return { ...week, workouts: updatedWorkouts };
            }
            return week;
          });
          
          return {
            ...storedPlan,
            plan: { ...storedPlan.plan, weeks: updatedWeeks },
            lastViewed: new Date().toISOString()
          };
        }
        return storedPlan;
      });

      storage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Failed to mark workout as completed:', error);
    }
  }

  /**
   * Get plan statistics
   */
  getPlanStats(planId: string): {
    totalWorkouts: number;
    completedWorkouts: number;
    completionPercentage: number;
    currentWeek: number;
  } {
    const storedPlan = this.getPlan(planId);
    if (!storedPlan) {
      return {
        totalWorkouts: 0,
        completedWorkouts: 0,
        completionPercentage: 0,
        currentWeek: 1
      };
    }

    const { plan } = storedPlan;
    const totalWorkouts = plan.weeks.reduce((total, week) => 
      total + week.workouts.filter(w => w.type !== 'rest').length, 0
    );

    const completedWorkouts = plan.weeks.reduce((total, week) =>
      total + week.workouts.filter(w => w.completed && w.type !== 'rest').length, 0
    );

    const completionPercentage = totalWorkouts > 0 ? 
      Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

    // Determine current week based on start date
    const planStartDate = new Date(plan.weeks[0]?.startDate || plan.generatedAt);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.max(Math.floor(daysDiff / 7) + 1, 1), plan.weeks.length);

    return {
      totalWorkouts,
      completedWorkouts,
      completionPercentage,
      currentWeek
    };
  }

  /**
   * Export plan data for sharing or backup
   */
  exportPlan(planId: string): string | null {
    const storedPlan = this.getPlan(planId);
    if (!storedPlan) return null;

    try {
      return JSON.stringify(storedPlan, null, 2);
    } catch (error) {
      console.error('Failed to export plan:', error);
      return null;
    }
  }

  /**
   * Clear all stored plans (for testing or reset)
   */
  clearAllPlans(): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.removeItem(STORAGE_KEYS.PLANS);
      storage.removeItem(STORAGE_KEYS.ACTIVE_PLAN);
    } catch (error) {
      console.error('Failed to clear plans from localStorage:', error);
    }
  }
}

// Export singleton instance
export const planStorage = new PlanStorage();
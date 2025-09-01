import { StravaActivity } from '@/types/strava';

export interface TrainingAnalysis {
  totalDistance: number;
  totalRunningTime: number; // in minutes
  averagePace: number; // in minutes per mile
  weeklyMileage: WeeklyMileage[];
  paceDistribution: PaceZone[];
  runFrequency: number; // runs per week
  longestRun: number;
  averageDistance: number;
  fitnessScore: number;
  recommendations: string[];
  lastUpdated: Date;
}

export interface WeeklyMileage {
  weekStart: Date;
  weekEnd: Date;
  distance: number;
  runs: number;
  averagePace: number;
}

export interface PaceZone {
  zone: 'easy' | 'tempo' | 'threshold' | 'interval' | 'repetition';
  minPace: number; // minutes per mile
  maxPace: number; // minutes per mile
  percentage: number;
  distance: number;
}

export class TrainingAnalyzer {
  private activities: StravaActivity[];

  constructor(activities: StravaActivity[]) {
    this.activities = activities.filter(activity => 
      (activity.sport_type === 'Run' || activity.sport_type === 'TrailRun' || activity.type === 'Run' || activity.type === 'TrailRun') && 
      activity.distance > 0 && 
      activity.moving_time > 0
    );
  }

  analyze(): TrainingAnalysis {
    const totalDistance = this.calculateTotalDistance();
    const totalRunningTime = this.calculateTotalRunningTime();
    const averagePace = this.calculateAveragePace();
    const weeklyMileage = this.calculateWeeklyMileage();
    const paceDistribution = this.calculatePaceDistribution();
    const runFrequency = this.calculateRunFrequency();
    const longestRun = this.calculateLongestRun();
    const averageDistance = this.calculateAverageDistance();
    const fitnessScore = this.calculateFitnessScore();
    const recommendations = this.generateRecommendations();

    return {
      totalDistance,
      totalRunningTime,
      averagePace,
      weeklyMileage,
      paceDistribution,
      runFrequency,
      longestRun,
      averageDistance,
      fitnessScore,
      recommendations,
      lastUpdated: new Date(),
    };
  }

  private calculateTotalDistance(): number {
    return this.activities.reduce((sum, activity) => sum + this.metersToMiles(activity.distance), 0);
  }

  private calculateTotalRunningTime(): number {
    return this.activities.reduce((sum, activity) => sum + (activity.moving_time / 60), 0);
  }

  private calculateAveragePace(): number {
    if (this.activities.length === 0) return 0;
    
    const totalMinutes = this.calculateTotalRunningTime();
    const totalMiles = this.calculateTotalDistance();
    
    return totalMiles > 0 ? totalMinutes / totalMiles : 0;
  }

  private calculateWeeklyMileage(): WeeklyMileage[] {
    const weeks: Map<string, { activities: StravaActivity[], weekStart: Date, weekEnd: Date }> = new Map();
    
    this.activities.forEach(activity => {
      const activityDate = new Date(activity.start_date);
      const weekStart = this.getWeekStart(activityDate);
      // Create a more specific key using year, month, and date to avoid collisions
      const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      
      if (!weeks.has(weekKey)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        weeks.set(weekKey, {
          activities: [],
          weekStart,
          weekEnd
        });
      }
      
      weeks.get(weekKey)!.activities.push(activity);
    });

    return Array.from(weeks.values())
      .map(week => ({
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
        distance: week.activities.reduce((sum, activity) => sum + this.metersToMiles(activity.distance), 0),
        runs: week.activities.length,
        averagePace: this.calculateWeekAveragePace(week.activities)
      }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .slice(0, 12);
  }

  private calculatePaceDistribution(): PaceZone[] {
    const paceZones: PaceZone[] = [
      { zone: 'easy', minPace: 0, maxPace: 0, percentage: 0, distance: 0 },
      { zone: 'tempo', minPace: 0, maxPace: 0, percentage: 0, distance: 0 },
      { zone: 'threshold', minPace: 0, maxPace: 0, percentage: 0, distance: 0 },
      { zone: 'interval', minPace: 0, maxPace: 0, percentage: 0, distance: 0 },
      { zone: 'repetition', minPace: 0, maxPace: 0, percentage: 0, distance: 0 }
    ];

    if (this.activities.length === 0) return paceZones;

    const averagePace = this.calculateAveragePace();
    const totalDistance = this.calculateTotalDistance();

    // Define pace zones based on average pace
    paceZones[0].minPace = averagePace + 1.5; // Easy: 1.5+ min slower than average
    paceZones[0].maxPace = averagePace + 3;
    
    paceZones[1].minPace = averagePace + 0.5; // Tempo: 0.5-1.5 min slower than average
    paceZones[1].maxPace = averagePace + 1.5;
    
    paceZones[2].minPace = averagePace - 0.5; // Threshold: 0.5 min faster to 0.5 min slower
    paceZones[2].maxPace = averagePace + 0.5;
    
    paceZones[3].minPace = averagePace - 1.5; // Interval: 0.5-1.5 min faster than average
    paceZones[3].maxPace = averagePace - 0.5;
    
    paceZones[4].minPace = 0; // Repetition: 1.5+ min faster than average
    paceZones[4].maxPace = averagePace - 1.5;

    // Calculate distance in each zone
    this.activities.forEach(activity => {
      const pace = this.calculateActivityPace(activity);
      const distance = this.metersToMiles(activity.distance);
      
      if (pace >= paceZones[0].minPace) {
        paceZones[0].distance += distance;
      } else if (pace >= paceZones[1].minPace) {
        paceZones[1].distance += distance;
      } else if (pace >= paceZones[2].minPace) {
        paceZones[2].distance += distance;
      } else if (pace >= paceZones[3].minPace) {
        paceZones[3].distance += distance;
      } else {
        paceZones[4].distance += distance;
      }
    });

    // Calculate percentages
    paceZones.forEach(zone => {
      zone.percentage = totalDistance > 0 ? (zone.distance / totalDistance) * 100 : 0;
    });

    return paceZones;
  }

  private calculateRunFrequency(): number {
    if (this.activities.length === 0) return 0;
    
    const weeks = this.calculateWeeklyMileage();
    const totalRuns = weeks.reduce((sum, week) => sum + week.runs, 0);
    
    return weeks.length > 0 ? totalRuns / weeks.length : 0;
  }

  private calculateLongestRun(): number {
    return Math.max(...this.activities.map(activity => this.metersToMiles(activity.distance)), 0);
  }

  private calculateAverageDistance(): number {
    if (this.activities.length === 0) return 0;
    return this.calculateTotalDistance() / this.activities.length;
  }

  private calculateFitnessScore(): number {
    const totalDistance = this.calculateTotalDistance();
    const runFrequency = this.calculateRunFrequency();
    const longestRun = this.calculateLongestRun();
    
    // Simple fitness score calculation (0-100)
    let score = 0;
    
    // Distance component (40% of score)
    score += Math.min((totalDistance / 200) * 40, 40);
    
    // Frequency component (30% of score)
    score += Math.min((runFrequency / 5) * 30, 30);
    
    // Long run component (20% of score)
    score += Math.min((longestRun / 20) * 20, 20);
    
    // Pace consistency component (10% of score)
    const paceVariation = this.calculatePaceVariation();
    score += Math.max(10 - (paceVariation * 2), 0);
    
    return Math.round(Math.max(Math.min(score, 100), 0));
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analysis = {
      totalDistance: this.calculateTotalDistance(),
      runFrequency: this.calculateRunFrequency(),
      longestRun: this.calculateLongestRun(),
      averagePace: this.calculateAveragePace(),
      paceDistribution: this.calculatePaceDistribution()
    };

    // Weekly mileage recommendations
    if (analysis.totalDistance < 50) {
      recommendations.push('Consider gradually increasing your weekly mileage to build aerobic base.');
    } else if (analysis.totalDistance > 200) {
      recommendations.push('Great weekly mileage! Focus on maintaining consistency and injury prevention.');
    }

    // Frequency recommendations
    if (analysis.runFrequency < 3) {
      recommendations.push('Try to run at least 3-4 times per week for better consistency.');
    } else if (analysis.runFrequency > 6) {
      recommendations.push('Consider adding rest days to prevent overtraining.');
    }

    // Long run recommendations
    if (analysis.longestRun < 8) {
      recommendations.push('Build up your long runs gradually to improve endurance.');
    }

    // Pace distribution recommendations
    const easyZone = analysis.paceDistribution.find(z => z.zone === 'easy');
    if (easyZone && easyZone.percentage < 60) {
      recommendations.push('Consider running more easy miles (60-80% of total volume).');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your training looks well-balanced! Keep up the consistent work.');
    }

    return recommendations;
  }

  // Helper methods
  private metersToMiles(meters: number): number {
    return meters * 0.000621371;
  }

  private calculateActivityPace(activity: StravaActivity): number {
    const miles = this.metersToMiles(activity.distance);
    const minutes = activity.moving_time / 60;
    return miles > 0 ? minutes / miles : 0;
  }

  private calculateWeekAveragePace(activities: StravaActivity[]): number {
    if (activities.length === 0) return 0;
    
    const totalMinutes = activities.reduce((sum, activity) => sum + (activity.moving_time / 60), 0);
    const totalMiles = activities.reduce((sum, activity) => sum + this.metersToMiles(activity.distance), 0);
    
    return totalMiles > 0 ? totalMinutes / totalMiles : 0;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.getFullYear(), d.getMonth(), diff);
    // Reset time to start of day to ensure consistent week boundaries
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private calculatePaceVariation(): number {
    if (this.activities.length < 2) return 0;
    
    const paces = this.activities.map(activity => this.calculateActivityPace(activity));
    const avgPace = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
    const variance = paces.reduce((sum, pace) => sum + Math.pow(pace - avgPace, 2), 0) / paces.length;
    
    return Math.sqrt(variance);
  }
}
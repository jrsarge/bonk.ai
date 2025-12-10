import { StravaActivity } from '@/types/strava';

export interface TrainingAnalysis {
  totalDistance: number;
  totalRunningTime: number; // in minutes
  averagePace: number; // in minutes per mile
  weeklyMileage: WeeklyMileage[];
  paceDistribution: PaceZone[];
  heartRateZones: HeartRateZone[];
  runFrequency: number; // runs per week
  longestRun: number;
  averageDistance: number;
  totalKudos: number;
  recommendations: string[];
  lastUpdated: Date;
}

export interface WeeklyMileage {
  weekStart: Date;
  weekEnd: Date;
  distance: number;
  runs: number;
  averagePace: number;
  elevationGain: number;
}

export interface PaceZone {
  zone: 'easy' | 'tempo' | 'threshold' | 'interval' | 'repetition';
  minPace: number; // minutes per mile
  maxPace: number; // minutes per mile
  percentage: number;
  distance: number;
}

export interface HeartRateZone {
  zone: 1 | 2 | 3 | 4 | 5;
  name: 'Recovery' | 'Aerobic' | 'Tempo' | 'Threshold' | 'VO2 Max';
  minHR: number;
  maxHR: number;
  percentage: number;
  distance: number;
  time: number; // in minutes
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
    const heartRateZones = this.calculateHeartRateZones();
    const runFrequency = this.calculateRunFrequency();
    const longestRun = this.calculateLongestRun();
    const averageDistance = this.calculateAverageDistance();
    const totalKudos = this.calculateTotalKudos();
    const recommendations = this.generateRecommendations();

    return {
      totalDistance,
      totalRunningTime,
      averagePace,
      weeklyMileage,
      paceDistribution,
      heartRateZones,
      runFrequency,
      longestRun,
      averageDistance,
      totalKudos,
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
        averagePace: this.calculateWeekAveragePace(week.activities),
        elevationGain: week.activities.reduce((sum, activity) => sum + (activity.total_elevation_gain || 0), 0)
      }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
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

  private calculateHeartRateZones(): HeartRateZone[] {
    // Filter activities with heart rate data
    const hrActivities = this.activities.filter(activity =>
      activity.has_heartrate && activity.average_heartrate > 0
    );

    // If no HR data, return empty zones
    if (hrActivities.length === 0) {
      return [
        { zone: 1, name: 'Recovery', minHR: 0, maxHR: 0, percentage: 0, distance: 0, time: 0 },
        { zone: 2, name: 'Aerobic', minHR: 0, maxHR: 0, percentage: 0, distance: 0, time: 0 },
        { zone: 3, name: 'Tempo', minHR: 0, maxHR: 0, percentage: 0, distance: 0, time: 0 },
        { zone: 4, name: 'Threshold', minHR: 0, maxHR: 0, percentage: 0, distance: 0, time: 0 },
        { zone: 5, name: 'VO2 Max', minHR: 0, maxHR: 0, percentage: 0, distance: 0, time: 0 }
      ];
    }

    // Estimate max HR from observed max heart rates
    const observedMaxHR = Math.max(...hrActivities.map(a => a.max_heartrate || a.average_heartrate));
    const maxHR = Math.max(observedMaxHR, 180); // Use at least 180 as baseline

    // Define HR zones based on percentage of max HR
    const zones: HeartRateZone[] = [
      { zone: 1, name: 'Recovery', minHR: Math.round(maxHR * 0.50), maxHR: Math.round(maxHR * 0.60), percentage: 0, distance: 0, time: 0 },
      { zone: 2, name: 'Aerobic', minHR: Math.round(maxHR * 0.60), maxHR: Math.round(maxHR * 0.70), percentage: 0, distance: 0, time: 0 },
      { zone: 3, name: 'Tempo', minHR: Math.round(maxHR * 0.70), maxHR: Math.round(maxHR * 0.80), percentage: 0, distance: 0, time: 0 },
      { zone: 4, name: 'Threshold', minHR: Math.round(maxHR * 0.80), maxHR: Math.round(maxHR * 0.90), percentage: 0, distance: 0, time: 0 },
      { zone: 5, name: 'VO2 Max', minHR: Math.round(maxHR * 0.90), maxHR: Math.round(maxHR * 1.00), percentage: 0, distance: 0, time: 0 }
    ];

    const totalDistance = hrActivities.reduce((sum, activity) => sum + this.metersToMiles(activity.distance), 0);

    // Classify each activity into zones based on average HR
    hrActivities.forEach(activity => {
      const avgHR = activity.average_heartrate;
      const distance = this.metersToMiles(activity.distance);
      const time = activity.moving_time / 60;

      // Find which zone this activity belongs to
      for (let i = zones.length - 1; i >= 0; i--) {
        if (avgHR >= zones[i].minHR) {
          zones[i].distance += distance;
          zones[i].time += time;
          break;
        }
      }
    });

    // Calculate percentages
    zones.forEach(zone => {
      zone.percentage = totalDistance > 0 ? (zone.distance / totalDistance) * 100 : 0;
    });

    return zones;
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

  private calculateTotalKudos(): number {
    return this.activities.reduce((sum, activity) => sum + (activity.kudos_count || 0), 0);
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
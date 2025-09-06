import { StravaActivity } from '@/types/strava';

export interface CyclingAnalysis {
  totalDistance: number;
  totalRidingTime: number; // in minutes
  averageSpeed: number; // in mph
  weeklyMileage: WeeklyCyclingMileage[];
  speedDistribution: SpeedZone[];
  rideFrequency: number; // rides per week
  longestRide: number;
  averageDistance: number;
  totalElevation: number;
  fitnessScore: number;
  recommendations: string[];
  lastUpdated: Date;
}

export interface WeeklyCyclingMileage {
  weekStart: Date;
  weekEnd: Date;
  distance: number;
  rides: number;
  averageSpeed: number;
  totalElevation: number;
}

export interface SpeedZone {
  zone: 'recovery' | 'endurance' | 'tempo' | 'threshold' | 'vo2max';
  minSpeed: number; // mph
  maxSpeed: number; // mph
  percentage: number;
  distance: number;
}

export class CyclingAnalyzer {
  private activities: StravaActivity[];

  constructor(activities: StravaActivity[]) {
    this.activities = activities.filter(activity => 
      (activity.sport_type === 'Ride' || activity.type === 'Ride') && 
      activity.distance > 0 && 
      activity.moving_time > 0
    );
  }

  analyze(): CyclingAnalysis {
    const totalDistance = this.calculateTotalDistance();
    const totalRidingTime = this.calculateTotalRidingTime();
    const averageSpeed = this.calculateAverageSpeed();
    const weeklyMileage = this.calculateWeeklyMileage();
    const speedDistribution = this.calculateSpeedDistribution();
    const rideFrequency = this.calculateRideFrequency();
    const longestRide = this.calculateLongestRide();
    const averageDistance = this.calculateAverageDistance();
    const totalElevation = this.calculateTotalElevation();
    const fitnessScore = this.calculateFitnessScore();
    const recommendations = this.generateRecommendations();

    return {
      totalDistance,
      totalRidingTime,
      averageSpeed,
      weeklyMileage,
      speedDistribution,
      rideFrequency,
      longestRide,
      averageDistance,
      totalElevation,
      fitnessScore,
      recommendations,
      lastUpdated: new Date(),
    };
  }

  private calculateTotalDistance(): number {
    return this.activities.reduce((sum, activity) => sum + this.metersToMiles(activity.distance), 0);
  }

  private calculateTotalRidingTime(): number {
    return this.activities.reduce((sum, activity) => sum + (activity.moving_time / 60), 0);
  }

  private calculateAverageSpeed(): number {
    if (this.activities.length === 0) return 0;
    
    const totalHours = this.calculateTotalRidingTime() / 60;
    const totalMiles = this.calculateTotalDistance();
    
    return totalHours > 0 ? totalMiles / totalHours : 0;
  }

  private calculateWeeklyMileage(): WeeklyCyclingMileage[] {
    const weeks: Map<string, { activities: StravaActivity[], weekStart: Date, weekEnd: Date }> = new Map();
    
    this.activities.forEach(activity => {
      const activityDate = new Date(activity.start_date);
      const weekStart = this.getWeekStart(activityDate);
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
        rides: week.activities.length,
        averageSpeed: this.calculateWeekAverageSpeed(week.activities),
        totalElevation: week.activities.reduce((sum, activity) => sum + (activity.total_elevation_gain || 0), 0)
      }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .slice(0, 12);
  }

  private calculateSpeedDistribution(): SpeedZone[] {
    const speedZones: SpeedZone[] = [
      { zone: 'recovery', minSpeed: 0, maxSpeed: 0, percentage: 0, distance: 0 },
      { zone: 'endurance', minSpeed: 0, maxSpeed: 0, percentage: 0, distance: 0 },
      { zone: 'tempo', minSpeed: 0, maxSpeed: 0, percentage: 0, distance: 0 },
      { zone: 'threshold', minSpeed: 0, maxSpeed: 0, percentage: 0, distance: 0 },
      { zone: 'vo2max', minSpeed: 0, maxSpeed: 0, percentage: 0, distance: 0 }
    ];

    if (this.activities.length === 0) return speedZones;

    const averageSpeed = this.calculateAverageSpeed();
    const totalDistance = this.calculateTotalDistance();

    // Define speed zones based on average speed (cycling zones are different from running)
    speedZones[0].minSpeed = 0; // Recovery: very easy pace
    speedZones[0].maxSpeed = averageSpeed * 0.7;
    
    speedZones[1].minSpeed = averageSpeed * 0.7; // Endurance: 70-85% of average
    speedZones[1].maxSpeed = averageSpeed * 0.85;
    
    speedZones[2].minSpeed = averageSpeed * 0.85; // Tempo: 85-95% of average
    speedZones[2].maxSpeed = averageSpeed * 0.95;
    
    speedZones[3].minSpeed = averageSpeed * 0.95; // Threshold: 95-105% of average
    speedZones[3].maxSpeed = averageSpeed * 1.05;
    
    speedZones[4].minSpeed = averageSpeed * 1.05; // VO2 Max: 105%+ of average
    speedZones[4].maxSpeed = averageSpeed * 2; // Cap at 2x average

    // Calculate distance in each zone
    this.activities.forEach(activity => {
      const speed = this.calculateActivitySpeed(activity);
      const distance = this.metersToMiles(activity.distance);
      
      if (speed <= speedZones[0].maxSpeed) {
        speedZones[0].distance += distance;
      } else if (speed <= speedZones[1].maxSpeed) {
        speedZones[1].distance += distance;
      } else if (speed <= speedZones[2].maxSpeed) {
        speedZones[2].distance += distance;
      } else if (speed <= speedZones[3].maxSpeed) {
        speedZones[3].distance += distance;
      } else {
        speedZones[4].distance += distance;
      }
    });

    // Calculate percentages
    speedZones.forEach(zone => {
      zone.percentage = totalDistance > 0 ? (zone.distance / totalDistance) * 100 : 0;
    });

    return speedZones;
  }

  private calculateRideFrequency(): number {
    if (this.activities.length === 0) return 0;
    
    const weeks = this.calculateWeeklyMileage();
    const totalRides = weeks.reduce((sum, week) => sum + week.rides, 0);
    
    return weeks.length > 0 ? totalRides / weeks.length : 0;
  }

  private calculateLongestRide(): number {
    return Math.max(...this.activities.map(activity => this.metersToMiles(activity.distance)), 0);
  }

  private calculateAverageDistance(): number {
    if (this.activities.length === 0) return 0;
    return this.calculateTotalDistance() / this.activities.length;
  }

  private calculateTotalElevation(): number {
    return this.activities.reduce((sum, activity) => sum + (activity.total_elevation_gain || 0), 0);
  }

  private calculateFitnessScore(): number {
    const totalDistance = this.calculateTotalDistance();
    const rideFrequency = this.calculateRideFrequency();
    const longestRide = this.calculateLongestRide();
    const averageSpeed = this.calculateAverageSpeed();
    
    // Cycling fitness score calculation (0-100)
    let score = 0;
    
    // Distance component (30% of score) - cyclists typically cover more distance
    score += Math.min((totalDistance / 500) * 30, 30);
    
    // Frequency component (25% of score)
    score += Math.min((rideFrequency / 4) * 25, 25);
    
    // Long ride component (25% of score)
    score += Math.min((longestRide / 50) * 25, 25);
    
    // Speed component (20% of score)
    score += Math.min((averageSpeed / 20) * 20, 20);
    
    return Math.round(Math.max(Math.min(score, 100), 0));
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analysis = {
      totalDistance: this.calculateTotalDistance(),
      rideFrequency: this.calculateRideFrequency(),
      longestRide: this.calculateLongestRide(),
      averageSpeed: this.calculateAverageSpeed(),
      speedDistribution: this.calculateSpeedDistribution()
    };

    // Weekly mileage recommendations
    if (analysis.totalDistance < 100) {
      recommendations.push('Consider gradually increasing your weekly mileage to build endurance base.');
    } else if (analysis.totalDistance > 500) {
      recommendations.push('Excellent weekly mileage! Focus on quality over quantity and recovery.');
    }

    // Frequency recommendations
    if (analysis.rideFrequency < 2) {
      recommendations.push('Try to ride at least 2-3 times per week for better fitness gains.');
    } else if (analysis.rideFrequency > 6) {
      recommendations.push('Consider adding rest days to prevent overtraining and burnout.');
    }

    // Long ride recommendations
    if (analysis.longestRide < 20) {
      recommendations.push('Build up your long rides gradually to improve endurance.');
    }

    // Speed distribution recommendations
    const enduranceZone = analysis.speedDistribution.find(z => z.zone === 'endurance');
    if (enduranceZone && enduranceZone.percentage < 50) {
      recommendations.push('Spend more time in the endurance zone (50-70% of total volume).');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your cycling training looks well-balanced! Keep up the consistent work.');
    }

    return recommendations;
  }

  // Helper methods
  private metersToMiles(meters: number): number {
    return meters * 0.000621371;
  }

  private calculateActivitySpeed(activity: StravaActivity): number {
    const miles = this.metersToMiles(activity.distance);
    const hours = activity.moving_time / 3600;
    return hours > 0 ? miles / hours : 0;
  }

  private calculateWeekAverageSpeed(activities: StravaActivity[]): number {
    if (activities.length === 0) return 0;
    
    const totalHours = activities.reduce((sum, activity) => sum + (activity.moving_time / 3600), 0);
    const totalMiles = activities.reduce((sum, activity) => sum + this.metersToMiles(activity.distance), 0);
    
    return totalHours > 0 ? totalMiles / totalHours : 0;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.getFullYear(), d.getMonth(), diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}
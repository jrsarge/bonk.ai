'use client';

import { CyclingAnalysis } from '@/lib/cycling/analysis';
import Card from '@/components/ui/Card';

interface CyclingMetricsGridProps {
  analysis: CyclingAnalysis;
}

export function CyclingMetricsGrid({ analysis }: CyclingMetricsGridProps) {
  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} mph`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatElevation = (feet: number) => {
    if (feet > 1000) {
      return `${(feet / 1000).toFixed(1)}k ft`;
    }
    return `${feet.toFixed(0)} ft`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const metrics = [
    {
      label: 'Total Distance',
      value: `${analysis.totalDistance.toFixed(1)} mi`,
      subtext: 'Last 12 weeks',
      icon: '🚴'
    },
    {
      label: 'Average Speed',
      value: formatSpeed(analysis.averageSpeed),
      subtext: 'overall',
      icon: '⚡'
    },
    {
      label: 'Weekly Frequency',
      value: `${analysis.rideFrequency.toFixed(1)}`,
      subtext: 'rides per week',
      icon: '📅'
    },
    {
      label: 'Longest Ride',
      value: `${analysis.longestRide.toFixed(1)} mi`,
      subtext: 'in period',
      icon: '🎯'
    },
    {
      label: 'Total Time',
      value: formatTime(analysis.totalRidingTime),
      subtext: 'riding',
      icon: '⏱️'
    },
    {
      label: 'Total Elevation',
      value: formatElevation(analysis.totalElevation * 3.28084), // Convert meters to feet
      subtext: 'climbed',
      icon: '⛰️'
    },
    {
      label: 'Fitness Score',
      value: analysis.fitnessScore.toString(),
      subtext: 'out of 100',
      icon: '💪',
      valueClass: getScoreColor(analysis.fitnessScore)
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <div className="p-4 text-center">
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className={`text-xl font-bold ${metric.valueClass || 'text-gray-900'}`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">{metric.label}</div>
            <div className="text-xs text-gray-500">{metric.subtext}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
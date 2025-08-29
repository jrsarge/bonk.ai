'use client';

import { TrainingAnalysis } from '@/lib/training/analysis';
import Card from '@/components/ui/Card';

interface MetricsGridProps {
  analysis: TrainingAnalysis;
}

export function MetricsGrid({ analysis }: MetricsGridProps) {
  const formatPace = (paceMinutes: number) => {
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
      icon: '🏃'
    },
    {
      label: 'Average Pace',
      value: formatPace(analysis.averagePace),
      subtext: 'per mile',
      icon: '⚡'
    },
    {
      label: 'Weekly Frequency',
      value: `${analysis.runFrequency.toFixed(1)}`,
      subtext: 'runs per week',
      icon: '📅'
    },
    {
      label: 'Longest Run',
      value: `${analysis.longestRun.toFixed(1)} mi`,
      subtext: 'in period',
      icon: '🎯'
    },
    {
      label: 'Total Time',
      value: formatTime(analysis.totalRunningTime),
      subtext: 'running',
      icon: '⏱️'
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
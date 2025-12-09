'use client';

import { TrainingAnalysis } from '@/lib/training/analysis';
import Card from '@/components/ui/Card';

interface MetricsGridProps {
  analysis: TrainingAnalysis;
  isFiltered?: boolean;
  filterLabel?: string;
}

export function MetricsGrid({ analysis, isFiltered = false, filterLabel }: MetricsGridProps) {
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

  const periodLabel = isFiltered && filterLabel ? filterLabel : 'Last 12 weeks';

  const metrics = [
    {
      label: 'Total Distance',
      value: `${analysis.totalDistance.toFixed(1)} mi`,
      subtext: periodLabel,
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
      subtext: periodLabel,
      icon: '🎯'
    },
    {
      label: 'Total Time',
      value: formatTime(analysis.totalRunningTime),
      subtext: 'running',
      icon: '⏱️'
    },
    {
      label: 'Total Kudos',
      value: analysis.totalKudos.toString(),
      subtext: periodLabel,
      icon: '👍'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <div className="p-4 text-center">
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{metric.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{metric.subtext}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { useTrainingAnalysis } from '@/lib/training/useAnalysis';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MetricsGrid } from './MetricsGrid';
import { WeeklyChart } from './WeeklyChart';
import { ElevationChart } from './ElevationChart';
import { PaceDistribution } from './PaceDistribution';
import { useApp } from '@/lib/auth/context';
import { TrainingAnalyzer } from '@/lib/training/analysis';

type TimePeriod = 4 | 12 | 26 | 52;

export function TrainingDashboard() {
  const { isStravaConnected } = useApp();
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(12);
  const {
    analysis,
    activities,
    isLoading,
    error,
    refreshAnalysis,
    lastFetched
  } = useTrainingAnalysis(timePeriod);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
    setSelectedWeekIndex(null); // Clear week selection when changing periods
    refreshAnalysis(newPeriod);
  };

  // Filter and recalculate analysis when a week is selected
  const { filteredAnalysis, filteredActivities } = useMemo(() => {
    if (!analysis || selectedWeekIndex === null) {
      return { filteredAnalysis: analysis, filteredActivities: activities };
    }

    // Get the selected week from the sorted data
    const sortedWeeks = [...analysis.weeklyMileage].sort((a, b) =>
      a.weekStart.getTime() - b.weekStart.getTime()
    );

    if (selectedWeekIndex >= sortedWeeks.length) {
      return { filteredAnalysis: analysis, filteredActivities: activities };
    }

    const selectedWeek = sortedWeeks[selectedWeekIndex];

    // Filter activities that fall within the selected week
    const weekActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= selectedWeek.weekStart && activityDate <= selectedWeek.weekEnd;
    });

    // Recalculate analysis for just this week's activities
    if (weekActivities.length === 0) {
      return { filteredAnalysis: analysis, filteredActivities: activities };
    }

    const analyzer = new TrainingAnalyzer(weekActivities);
    return {
      filteredAnalysis: analyzer.analyze(),
      filteredActivities: weekActivities
    };
  }, [analysis, selectedWeekIndex, activities]);

  const handleWeekClick = (index: number | null) => {
    // Toggle selection: if clicking the same week, deselect it
    setSelectedWeekIndex(prev => prev === index ? null : index);
  };

  if (!isStravaConnected) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Connect Strava to View Training Analysis</h2>
        <p className="text-gray-600 mb-6">
          Connect your Strava account to analyze your last 12 weeks of running data
          and get personalized training insights.
        </p>
      </Card>
    );
  }

  if (isLoading && !analysis) {
    return (
      <Card className="p-8 text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p>Analyzing your training data...</p>
      </Card>
    );
  }

  if (error && !analysis) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <h3 className="font-semibold">Error Loading Training Data</h3>
          <p className="mt-2">{error}</p>
        </div>
        <Button onClick={refreshAnalysis} disabled={isLoading}>
          {isLoading ? 'Retrying...' : 'Try Again'}
        </Button>
      </Card>
    );
  }

  if (!analysis || activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-4">No Running Data Found</h3>
        <p className="text-gray-600 mb-4">
          No running activities found in the last 12 weeks. 
          Make sure you have running activities recorded in Strava.
        </p>
        <Button onClick={refreshAnalysis} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Refresh Data'}
        </Button>
      </Card>
    );
  }

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const getPeriodLabel = (weeks: TimePeriod) => {
    if (weeks === 4) return '4 weeks';
    if (weeks === 12) return '12 weeks';
    if (weeks === 26) return '6 months';
    return '1 year';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">Training Analysis</h1>
          <p className="text-gray-600">
            Last {getPeriodLabel(timePeriod)} • {activities.length} runs • Updated {formatLastUpdated(lastFetched)}
          </p>
        </div>
        <Button
          onClick={() => refreshAnalysis()}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Time Period Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Time Period:</span>
          <div className="flex gap-2">
            {([4, 12, 26, 52] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Error banner */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-800">Failed to refresh data: {error}</p>
            <Button size="sm" onClick={refreshAnalysis} disabled={isLoading}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Filter indicator */}
      {selectedWeekIndex !== null && analysis && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Viewing week of {(() => {
                  const sortedWeeks = [...analysis.weeklyMileage].sort((a, b) =>
                    a.weekStart.getTime() - b.weekStart.getTime()
                  );
                  return sortedWeeks[selectedWeekIndex]?.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })()}
              </span>
              <span className="text-xs text-blue-700 dark:text-blue-300 ml-2">
                (Click the point again or elsewhere to view all weeks)
              </span>
            </div>
            <button
              onClick={() => setSelectedWeekIndex(null)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Synchronized Charts */}
        <div className="space-y-6">
          <WeeklyChart
            weeklyMileage={analysis?.weeklyMileage || []}
            hoveredIndex={hoveredWeekIndex}
            onHoverChange={setHoveredWeekIndex}
            selectedIndex={selectedWeekIndex}
            onWeekClick={handleWeekClick}
          />
          <ElevationChart
            weeklyMileage={analysis?.weeklyMileage || []}
            hoveredIndex={hoveredWeekIndex}
            onHoverChange={setHoveredWeekIndex}
            selectedIndex={selectedWeekIndex}
            onWeekClick={handleWeekClick}
          />
        </div>

        {/* Right Column - Heart Rate Zone Distribution */}
        <PaceDistribution
          heartRateZones={filteredAnalysis?.heartRateZones || analysis.heartRateZones}
          activities={filteredActivities}
        />
      </div>

      {/* Key Metrics */}
      <MetricsGrid
        analysis={filteredAnalysis || analysis}
        isFiltered={selectedWeekIndex !== null}
        filterLabel={selectedWeekIndex !== null && analysis ? (() => {
          const sortedWeeks = [...analysis.weeklyMileage].sort((a, b) =>
            a.weekStart.getTime() - b.weekStart.getTime()
          );
          const weekDate = sortedWeeks[selectedWeekIndex]?.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `Week of ${weekDate}`;
        })() : undefined}
      />

      {/* Recommendations */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Training Recommendations</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
}
'use client';

import { useState, useMemo, useEffect } from 'react';
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

export function TrainingDashboard() {
  const { isStravaConnected } = useApp();
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = most recent 12 weeks, 1 = 12 weeks before, etc.
  const {
    analysis,
    activities,
    isLoading,
    error,
    refreshAnalysis,
    lastFetched
  } = useTrainingAnalysis();

  // Filter activities by week offset (12-week periods)
  const { periodAnalysis, periodActivities, periodLabel, canGoBack, canGoForward } = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        periodAnalysis: analysis,
        periodActivities: activities,
        periodLabel: 'Last 12 weeks',
        canGoBack: false,
        canGoForward: false
      };
    }

    // Calculate date range for the current offset
    const now = new Date();
    const weeksPerPeriod = 12;
    const startOffset = weekOffset * weeksPerPeriod;
    const endOffset = (weekOffset + 1) * weeksPerPeriod;

    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() - (startOffset * 7));
    periodEnd.setHours(23, 59, 59, 999); // Set to end of day

    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - (endOffset * 7));
    periodStart.setHours(0, 0, 0, 0); // Set to start of day

    // Filter activities for this period
    const periodActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= periodStart && activityDate <= periodEnd;
    });

    // Recalculate analysis for this period
    let periodAnalysis = analysis;
    if (periodActivities.length > 0) {
      const analyzer = new TrainingAnalyzer(periodActivities);
      periodAnalysis = analyzer.analyze();
    }

    // Create label
    const periodLabel = weekOffset === 0
      ? 'Last 12 weeks'
      : `${periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${periodEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

    // Check if we can navigate
    const oldestActivity = activities.length > 0
      ? new Date(Math.min(...activities.map(a => new Date(a.start_date).getTime())))
      : now;
    const canGoBack = periodStart > oldestActivity;
    const canGoForward = weekOffset > 0;

    return {
      periodAnalysis,
      periodActivities,
      periodLabel,
      canGoBack,
      canGoForward
    };
  }, [activities, analysis, weekOffset]);

  // Filter and recalculate analysis when a week is selected
  const { filteredAnalysis, filteredActivities } = useMemo(() => {
    if (!periodAnalysis || selectedWeekIndex === null) {
      return { filteredAnalysis: periodAnalysis, filteredActivities: periodActivities };
    }

    // Get the selected week from the sorted data
    const sortedWeeks = [...periodAnalysis.weeklyMileage].sort((a, b) =>
      a.weekStart.getTime() - b.weekStart.getTime()
    );

    if (selectedWeekIndex >= sortedWeeks.length) {
      return { filteredAnalysis: periodAnalysis, filteredActivities: periodActivities };
    }

    const selectedWeek = sortedWeeks[selectedWeekIndex];

    // Filter activities that fall within the selected week
    const weekActivities = periodActivities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= selectedWeek.weekStart && activityDate <= selectedWeek.weekEnd;
    });

    // Recalculate analysis for just this week's activities
    if (weekActivities.length === 0) {
      return { filteredAnalysis: periodAnalysis, filteredActivities: periodActivities };
    }

    const analyzer = new TrainingAnalyzer(weekActivities);
    return {
      filteredAnalysis: analyzer.analyze(),
      filteredActivities: weekActivities
    };
  }, [periodAnalysis, selectedWeekIndex, periodActivities]);

  const handleWeekClick = (index: number | null) => {
    // Toggle selection: if clicking the same week, deselect it
    setSelectedWeekIndex(prev => prev === index ? null : index);
  };

  // Clear selected week when changing periods
  useEffect(() => {
    setSelectedWeekIndex(null);
  }, [weekOffset]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">Training Analysis</h1>
          <p className="text-gray-600">
            Last 12 weeks • {activities.length} runs • Updated {formatLastUpdated(lastFetched)}
          </p>
        </div>
        <Button 
          onClick={refreshAnalysis} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

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

      {/* Period Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={!canGoBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="View previous 12 weeks"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{periodLabel}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {periodActivities.length} runs
              </div>
            </div>

            <button
              onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
              disabled={!canGoForward}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="View next 12 weeks"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {weekOffset > 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Return to current period
            </button>
          )}
        </div>
      </Card>

      {/* Filter indicator */}
      {selectedWeekIndex !== null && periodAnalysis && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Viewing week of {(() => {
                  const sortedWeeks = [...periodAnalysis.weeklyMileage].sort((a, b) =>
                    a.weekStart.getTime() - b.weekStart.getTime()
                  );
                  return sortedWeeks[selectedWeekIndex]?.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })()}
              </span>
              <span className="text-xs text-blue-700 dark:text-blue-300 ml-2">
                (Click the point again or elsewhere to view all weeks in period)
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
            weeklyMileage={periodAnalysis.weeklyMileage}
            hoveredIndex={hoveredWeekIndex}
            onHoverChange={setHoveredWeekIndex}
            selectedIndex={selectedWeekIndex}
            onWeekClick={handleWeekClick}
          />
          <ElevationChart
            weeklyMileage={periodAnalysis.weeklyMileage}
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
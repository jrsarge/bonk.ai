'use client';

import { useCyclingAnalysis } from '@/lib/cycling/useAnalysis';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CyclingMetricsGrid } from './CyclingMetricsGrid';
import { WeeklyCyclingChart } from './WeeklyCyclingChart';
import { SpeedDistribution } from './SpeedDistribution';
import { useApp } from '@/lib/auth/context';

export function CyclingDashboard() {
  const { isStravaConnected } = useApp();
  const { 
    analysis, 
    activities, 
    isLoading, 
    error, 
    refreshAnalysis, 
    lastFetched 
  } = useCyclingAnalysis();

  if (!isStravaConnected) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Connect Strava to View Cycling Analysis</h2>
        <p className="text-gray-600 mb-6">
          Connect your Strava account to analyze your last 12 weeks of cycling data
          and get personalized training insights.
        </p>
      </Card>
    );
  }

  if (isLoading && !analysis) {
    return (
      <Card className="p-8 text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p>Analyzing your cycling data...</p>
      </Card>
    );
  }

  if (error && !analysis) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <h3 className="font-semibold">Error Loading Cycling Data</h3>
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
        <h3 className="text-lg font-semibold mb-4">No Cycling Data Found</h3>
        <p className="text-gray-600 mb-4">
          No cycling activities found in the last 12 weeks. 
          Make sure you have cycling activities recorded in Strava.
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
          <h1 className="text-2xl font-bold mb-2">Cycling Analysis</h1>
          <p className="text-gray-600">
            Last 12 weeks • {activities.length} rides • Updated {formatLastUpdated(lastFetched)}
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

      {/* Key Metrics */}
      <CyclingMetricsGrid analysis={analysis} />

      {/* Charts and Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <WeeklyCyclingChart weeklyMileage={analysis.weeklyMileage} />
        <SpeedDistribution speedDistribution={analysis.speedDistribution} />
      </div>

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
'use client';

import { useTrainingAnalysis } from '@/lib/training/useAnalysis';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MetricsGrid } from './MetricsGrid';
import { WeeklyChart } from './WeeklyChart';
import { PaceDistribution } from './PaceDistribution';
import { RecentActivities } from './RecentActivities';
import { useApp } from '@/lib/auth/context';

export function TrainingDashboard() {
  const { isStravaConnected } = useApp();
  const { 
    analysis, 
    activities, 
    isLoading, 
    error, 
    refreshAnalysis, 
    lastFetched 
  } = useTrainingAnalysis();

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

      {/* Key Metrics */}
      <MetricsGrid analysis={analysis} />

      {/* Charts and Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <WeeklyChart weeklyMileage={analysis.weeklyMileage} />
        <PaceDistribution paceDistribution={analysis.paceDistribution} />
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

      {/* Recent Activities */}
      <RecentActivities activities={activities.slice(0, 10)} />
    </div>
  );
}
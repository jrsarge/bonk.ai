import { TrainingPlan } from '@/types';
import { useState } from 'react';

interface PlanOverviewProps {
  plan: TrainingPlan;
  className?: string;
  onWeekSelect?: (weekNumber: number) => void;
}

const formatRaceDistance = (distance: string): string => {
  switch (distance) {
    case '5k': return '5K';
    case '10k': return '10K';
    case 'half': return 'Half Marathon';
    case 'marathon': return 'Marathon';
    default: return distance.toUpperCase();
  }
};

const getWorkoutTypeColor = (type: string) => {
  switch (type) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'tempo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'interval': return 'bg-red-100 text-red-800 border-red-200';
    case 'long': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'rest': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cross': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'race': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getEffortLevelText = (level: number) => {
  switch (level) {
    case 1: return 'Very Easy';
    case 2: return 'Easy';
    case 3: return 'Moderate';
    case 4: return 'Hard';
    case 5: return 'Very Hard';
    default: return 'Unknown';
  }
};

export default function PlanOverview({ plan, className = '', onWeekSelect }: PlanOverviewProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {plan.customName ? `${plan.customName} Training Plan` : `${formatRaceDistance(plan.raceDistance)} Training Plan`}
            </h2>
            {plan.customName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatRaceDistance(plan.raceDistance)}
              </p>
            )}
            <div className="space-y-1">
              {plan.targetTime && (
                <p className="text-gray-600 dark:text-gray-300">
                  Target Time: {plan.targetTime}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generated: {new Date(plan.generatedAt).toLocaleDateString()}
              </p>
              {plan.summary.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {plan.summary.description}
                </p>
              )}
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* Weekly Overview Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Weekly Breakdown
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {plan.weeks.map((week) => (
                <div
                  key={week.weekNumber}
                  onClick={() => onWeekSelect?.(week.weekNumber)}
                  className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center transition-colors ${
                    onWeekSelect ? 'hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer hover:shadow-md' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Week {week.weekNumber}
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {week.totalDistance.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    miles
                  </div>
                  {week.theme && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {week.theme}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Plan Summary and Pace Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Plan Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Weeks
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.summary.totalWeeks}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Peak Week
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.summary.peakWeeklyMileage.toFixed(0)} mi
                  </div>
                </div>
              </div>
            </div>

            {plan.summary.paceRecommendations && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Pace Guide
                </h3>
                <div className="space-y-2">
                  {Object.entries(plan.summary.paceRecommendations).map(([type, pace]) => (
                    <div key={type} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {type} Pace:
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {pace}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Detailed Weekly View */}
          <div className="space-y-8">
            {plan.weeks.map((week) => (
              <div key={week.weekNumber} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Week {week.weekNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {week.theme} • {week.totalDistance.toFixed(1)} miles total
                    </p>
                    {week.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {week.description}
                      </p>
                    )}
                  </div>
                  {week.keyWorkout && (
                    <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                      Key: {week.keyWorkout}
                    </div>
                  )}
                </div>
                
                <div className="grid gap-3">
                  {week.workouts.map((workout, workoutIndex) => (
                    <div key={workoutIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Day {workout.day}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(workout.date)}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getWorkoutTypeColor(workout.type)}`}>
                            {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          {workout.distance && (
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {workout.distance.toFixed(1)} mi
                            </div>
                          )}
                          {workout.duration && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {workout.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {workout.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {workout.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs">
                        {workout.targetPace && (
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500 dark:text-gray-400">Target Pace:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{workout.targetPace}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 dark:text-gray-400">Effort:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {workout.effortLevel}/5 ({getEffortLevelText(workout.effortLevel)})
                          </span>
                        </div>
                        {workout.notes && (
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                            <span className="text-gray-600 dark:text-gray-300">{workout.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
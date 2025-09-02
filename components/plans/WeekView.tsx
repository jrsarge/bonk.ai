'use client';

import { TrainingPlan, TrainingWeek } from '@/types';
import WorkoutCard from './WorkoutCard';

interface WeekViewProps {
  plan: TrainingPlan;
  weekNumber: number;
  onDaySelect?: (dayNumber: number) => void;
  onBackToOverview?: () => void;
  className?: string;
}

const getWeekStats = (week: TrainingWeek): { total: number } => {
  const workouts = week.workouts.filter(w => w.type !== 'rest');
  const total = workouts.length;
  
  return { total };
};

export default function WeekView({ 
  plan, 
  weekNumber, 
  onDaySelect, 
  onBackToOverview,
  className = '' 
}: WeekViewProps) {
  const week = plan.weeks.find(w => w.weekNumber === weekNumber);
  
  if (!week) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">Week not found</p>
          <p className="text-sm">Unable to find week {weekNumber} in this training plan.</p>
          {onBackToOverview && (
            <button
              onClick={onBackToOverview}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Return to plan overview
            </button>
          )}
        </div>
      </div>
    );
  }

  const stats = getWeekStats(week);
  const startDate = new Date(week.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Week header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Week {weekNumber}: {week.theme}
              </h2>
              {week.keyWorkout && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  Key Week
                </span>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Dates:</strong> {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
              <p>
                <strong>Total Distance:</strong> {week.totalDistance.toFixed(1)} miles
              </p>
              {week.keyWorkout && (
                <p>
                  <strong>Key Workout:</strong> {week.keyWorkout}
                </p>
              )}
            </div>
            
            {week.description && (
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {week.description}
              </p>
            )}
          </div>

          {/* Week stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Week Overview
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.total} workouts
              </span>
            </div>
            
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {week.totalDistance.toFixed(1)} mi
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                total distance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {week.workouts.map((workout) => (
          <div
            key={workout.day}
            className={`transition-all duration-200 ${
              onDaySelect ? 'hover:scale-[1.02] cursor-pointer' : ''
            }`}
            onClick={() => onDaySelect?.(workout.day)}
          >
            <WorkoutCard
              workout={workout}
              className={`h-full ${onDaySelect ? 'hover:shadow-lg' : ''}`}
            />
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {week.workouts.filter(w => w.type === 'easy').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Easy Runs
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {week.workouts.filter(w => w.type === 'tempo').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Tempo
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
            {week.workouts.filter(w => w.type === 'interval').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Intervals
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {week.workouts.filter(w => w.type === 'long').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Long Runs
          </div>
        </div>
      </div>
    </div>
  );
}
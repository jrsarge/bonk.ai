'use client';

import { useState } from 'react';
import { TrainingPlan } from '@/types';
import { planStorage } from '@/lib/storage/plans';

interface DayViewProps {
  plan: TrainingPlan;
  weekNumber: number;
  dayNumber: number;
  onBackToWeek?: () => void;
  onNavigateDay?: (direction: 'prev' | 'next') => void;
  className?: string;
}

const getDayName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber - 1] || `Day ${dayNumber}`;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'rest': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'tempo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'interval': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'long': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'cross': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'race': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getEffortLevelColor = (level: number) => {
  switch (level) {
    case 1: return 'bg-green-500';
    case 2: return 'bg-yellow-400';
    case 3: return 'bg-orange-400';
    case 4: return 'bg-red-400';
    case 5: return 'bg-red-600';
    default: return 'bg-gray-400';
  }
};

export default function DayView({ 
  plan, 
  weekNumber, 
  dayNumber, 
  onBackToWeek, 
  onNavigateDay,
  className = '' 
}: DayViewProps) {
  const [notes, setNotes] = useState('');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  const week = plan.weeks.find(w => w.weekNumber === weekNumber);
  const workout = week?.workouts.find(w => w.day === dayNumber);

  if (!week || !workout) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">Workout not found</p>
          <p className="text-sm">Unable to find the workout for Week {weekNumber}, Day {dayNumber}.</p>
          {onBackToWeek && (
            <button
              onClick={onBackToWeek}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Return to week view
            </button>
          )}
        </div>
      </div>
    );
  }


  const isRestDay = workout.type === 'rest';
  const workoutDate = new Date(workout.date);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Day header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getDayName(dayNumber)}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(workout.type)}`}>
                {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
              </span>
            </div>
            
            <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              {workout.name}
            </h2>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Week {weekNumber}</span>
              <span>•</span>
              <span>{workoutDate.toLocaleDateString()}</span>
              {week.theme && (
                <>
                  <span>•</span>
                  <span>{week.theme}</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Workout details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Main workout info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Workout Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {workout.description}
              </p>
            </div>

            {!isRestDay && (
              <div className="grid grid-cols-2 gap-4">
                {workout.distance && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distance</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {workout.distance.toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">mi</span>
                    </div>
                  </div>
                )}
                
                {workout.duration && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {workout.duration}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">min</span>
                    </div>
                  </div>
                )}
                
                {workout.targetPace && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 col-span-2">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Target Pace</div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {workout.targetPace}
                      <span className="text-sm font-normal text-blue-600 dark:text-blue-400 ml-1">per mile</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Effort level */}
            {!isRestDay && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Effort Level</div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-4 h-4 rounded-full ${
                          level <= workout.effortLevel
                            ? getEffortLevelColor(workout.effortLevel)
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {workout.effortLevel}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional info and notes */}
        <div className="space-y-6">
          {/* Coach notes */}
          {workout.notes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Coach Notes
              </h4>
              <p className="text-blue-800 dark:text-blue-200">
                {workout.notes}
              </p>
            </div>
          )}

          {/* Personal notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Personal Notes
              </h4>
              <button
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isNotesExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            
            {isNotesExpanded ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this workout..."
                  className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setIsNotesExpanded(false)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Save notes logic would go here
                      setIsNotesExpanded(false);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Click &quot;Expand&quot; to add personal notes about this workout.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateDay?.('prev')}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous Day</span>
          </button>

          <button
            onClick={onBackToWeek}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Week View
          </button>

          <button
            onClick={() => onNavigateDay?.('next')}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span>Next Day</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
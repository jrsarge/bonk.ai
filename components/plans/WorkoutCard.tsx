import { TrainingWorkout } from '@/types';
import { planStorage } from '@/lib/storage/plans';

interface WorkoutCardProps {
  workout: TrainingWorkout;
  planId: string;
  weekNumber: number;
  className?: string;
}

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

const getDayName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber - 1] || `Day ${dayNumber}`;
};

export default function WorkoutCard({ workout, planId, weekNumber, className = '' }: WorkoutCardProps) {
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    planStorage.markWorkoutCompleted(planId, weekNumber, workout.day);
    // Force a re-render by triggering a small delay
    setTimeout(() => window.dispatchEvent(new Event('storage')), 100);
  };

  const isRestDay = workout.type === 'rest';

  return (
    <div className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 ${workout.completed ? 'ring-2 ring-green-200 dark:ring-green-800' : 'hover:border-blue-300 dark:hover:border-blue-600'} ${className}`}>
      {/* Completion overlay */}
      {workout.completed && !isRestDay && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {getDayName(workout.day)}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeColor(workout.type)}`}>
              {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {workout.name}
          </p>
        </div>
        
        {!isRestDay && !workout.completed && (
          <button
            onClick={handleToggleComplete}
            className="ml-2 w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-500 hover:border-green-400 dark:hover:border-green-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
          </button>
        )}
      </div>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
        {workout.description}
      </p>
      
      {/* Workout Details */}
      {!isRestDay && (
        <div className="space-y-2 text-sm">
          {/* Main metrics */}
          <div className="flex items-center justify-between">
            {workout.distance && (
              <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium">{workout.distance.toFixed(1)} mi</span>
              </div>
            )}
            
            {workout.duration && (
              <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{workout.duration} min</span>
              </div>
            )}
          </div>
          
          {/* Target pace */}
          {workout.targetPace && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Target Pace</span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {workout.targetPace}
                </span>
              </div>
            </div>
          )}
          
          {/* Effort level */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Effort</span>
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      level <= workout.effortLevel
                        ? getEffortLevelColor(workout.effortLevel)
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                {workout.effortLevel}/5
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Rest day content */}
      {isRestDay && (
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400">Rest & Recovery</span>
          </div>
        </div>
      )}
      
      {/* Notes indicator */}
      {workout.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {workout.notes}
            </p>
          </div>
        </div>
      )}

      {/* Date footer */}
      {workout.date && (
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{new Date(workout.date).toLocaleDateString()}</span>
            {!isRestDay && !workout.completed && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                Click to mark complete
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
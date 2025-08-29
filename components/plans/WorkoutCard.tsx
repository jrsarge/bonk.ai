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
  const handleToggleComplete = () => {
    planStorage.markWorkoutCompleted(planId, weekNumber, workout.day);
    // Force a re-render by triggering a small delay
    setTimeout(() => window.dispatchEvent(new Event('storage')), 100);
  };

  const isRestDay = workout.type === 'rest';

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${workout.completed ? 'opacity-75' : ''} ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {getDayName(workout.day)}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {workout.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workout.type)}`}>
            {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
          </span>
          {!isRestDay && (
            <button
              onClick={handleToggleComplete}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                workout.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {workout.completed && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
        {workout.description}
      </p>
      
      {/* Workout Details */}
      {!isRestDay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {workout.distance && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400">Distance:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {workout.distance.toFixed(1)} mi
              </span>
            </div>
          )}
          {workout.duration && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {workout.duration} min
              </span>
            </div>
          )}
          {workout.targetPace && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400">Target Pace:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {workout.targetPace}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">Effort:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= workout.effortLevel
                      ? getEffortLevelColor(workout.effortLevel)
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Notes */}
      {workout.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            💡 {workout.notes}
          </p>
        </div>
      )}

      {/* Date */}
      {workout.date && (
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {new Date(workout.date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
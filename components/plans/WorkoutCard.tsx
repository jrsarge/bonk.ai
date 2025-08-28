import { Workout } from '@/types';

interface WorkoutCardProps {
  workout: Workout;
  className?: string;
}

export default function WorkoutCard({ workout, className = '' }: WorkoutCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rest': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'tempo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'interval': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'long': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} Workout
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workout.type)}`}>
          {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
        {workout.description}
      </p>
      
      <div className="flex flex-wrap gap-4 text-sm">
        {workout.distance && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 dark:text-gray-400">Distance:</span>
            <span className="font-medium text-gray-900 dark:text-white">{workout.distance} miles</span>
          </div>
        )}
        {workout.duration && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 dark:text-gray-400">Duration:</span>
            <span className="font-medium text-gray-900 dark:text-white">{workout.duration} min</span>
          </div>
        )}
        {workout.pace && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 dark:text-gray-400">Pace:</span>
            <span className="font-medium text-gray-900 dark:text-white">{workout.pace}</span>
          </div>
        )}
      </div>
      
      {workout.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            {workout.notes}
          </p>
        </div>
      )}
    </div>
  );
}
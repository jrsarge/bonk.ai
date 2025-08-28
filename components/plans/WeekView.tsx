import { Week } from '@/types';

interface WeekViewProps {
  week: Week;
  weekNumber: number;
}

export default function WeekView({ week, weekNumber }: WeekViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Week {weekNumber}: {week.theme}
        </h3>
      </div>

      <div className="grid gap-4">
        {week.workouts.map((workout, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Day {workout.day}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workout.type === 'rest' ? 'bg-gray-100 text-gray-800' :
                workout.type === 'easy' ? 'bg-green-100 text-green-800' :
                workout.type === 'tempo' ? 'bg-orange-100 text-orange-800' :
                workout.type === 'interval' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              {workout.description}
            </p>
            <div className="flex space-x-4 text-sm">
              {workout.distance && (
                <span className="text-gray-500 dark:text-gray-400">
                  Distance: {workout.distance} miles
                </span>
              )}
              {workout.pace && (
                <span className="text-gray-500 dark:text-gray-400">
                  Pace: {workout.pace}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { TrainingPlan } from '@/types';

interface PlanOverviewProps {
  plan: TrainingPlan;
  className?: string;
}

export default function PlanOverview({ plan, className = '' }: PlanOverviewProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.raceDistance.toUpperCase()} Training Plan
        </h2>
        {plan.targetTime && (
          <p className="text-gray-600 dark:text-gray-300">
            Target Time: {plan.targetTime}
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {plan.planData.weeks.map((week) => (
          <div
            key={week.weekNumber}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Week {week.weekNumber}
            </div>
            <div className="text-lg font-bold text-primary mb-1">
              {week.totalDistance.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              miles
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Plan Summary
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Total Weeks
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {plan.planData.weeks.length}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Peak Week
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.max(...plan.planData.weeks.map(w => w.totalDistance)).toFixed(0)} mi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
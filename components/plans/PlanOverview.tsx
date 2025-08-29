import { TrainingPlan } from '@/types';

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

export default function PlanOverview({ plan, className = '', onWeekSelect }: PlanOverviewProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {formatRaceDistance(plan.raceDistance)} Training Plan
        </h2>
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
    </div>
  );
}
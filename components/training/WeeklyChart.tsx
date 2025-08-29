'use client';

import { WeeklyMileage } from '@/lib/training/analysis';
import Card from '@/components/ui/Card';

interface WeeklyChartProps {
  weeklyMileage: WeeklyMileage[];
}

export function WeeklyChart({ weeklyMileage }: WeeklyChartProps) {
  const maxDistance = Math.max(...weeklyMileage.map(w => w.distance));
  const avgDistance = weeklyMileage.reduce((sum, w) => sum + w.distance, 0) / weeklyMileage.length;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPace = (paceMinutes: number) => {
    if (paceMinutes === 0) return '--';
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Mileage Trend</h3>
        
        {weeklyMileage.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No weekly data available
          </div>
        ) : (
          <>
            {/* Chart bars */}
            <div className="space-y-3 mb-6">
              {weeklyMileage.map((week, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-500 flex-shrink-0">
                    {formatDate(week.weekStart)}
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: maxDistance > 0 ? `${(week.distance / maxDistance) * 100}%` : '0%'
                        }}
                      >
                        {week.distance > 0 && (
                          <span className="text-xs text-white font-medium">
                            {week.distance.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-12 text-xs text-gray-600 text-center flex-shrink-0">
                    {week.runs}
                    <div className="text-xs text-gray-400">runs</div>
                  </div>
                  
                  <div className="w-12 text-xs text-gray-600 text-center flex-shrink-0">
                    {formatPace(week.averagePace)}
                    <div className="text-xs text-gray-400">pace</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm font-semibold">{avgDistance.toFixed(1)} mi</div>
                <div className="text-xs text-gray-500">Avg Weekly</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{maxDistance.toFixed(1)} mi</div>
                <div className="text-xs text-gray-500">Peak Week</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">
                  {weeklyMileage.reduce((sum, w) => sum + w.runs, 0)}
                </div>
                <div className="text-xs text-gray-500">Total Runs</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
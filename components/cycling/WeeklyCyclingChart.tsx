'use client';

import { WeeklyCyclingMileage } from '@/lib/cycling/analysis';
import Card from '@/components/ui/Card';

interface WeeklyCyclingChartProps {
  weeklyMileage: WeeklyCyclingMileage[];
}

export function WeeklyCyclingChart({ weeklyMileage }: WeeklyCyclingChartProps) {
  const maxDistance = Math.max(...weeklyMileage.map(w => w.distance));
  const avgDistance = weeklyMileage.reduce((sum, w) => sum + w.distance, 0) / weeklyMileage.length;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSpeed = (speed: number) => {
    if (speed === 0) return '--';
    return `${speed.toFixed(1)} mph`;
  };

  const formatElevation = (elevation: number) => {
    if (elevation === 0) return '--';
    return `${Math.round(elevation * 3.28084)}ft`; // Convert meters to feet
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
                    {week.rides}
                    <div className="text-xs text-gray-400">rides</div>
                  </div>
                  
                  <div className="w-16 text-xs text-gray-600 text-center flex-shrink-0">
                    {formatSpeed(week.averageSpeed)}
                    <div className="text-xs text-gray-400">speed</div>
                  </div>
                  
                  <div className="w-12 text-xs text-gray-600 text-center flex-shrink-0">
                    {formatElevation(week.totalElevation)}
                    <div className="text-xs text-gray-400">elev</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
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
                  {weeklyMileage.reduce((sum, w) => sum + w.rides, 0)}
                </div>
                <div className="text-xs text-gray-500">Total Rides</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">
                  {Math.round(weeklyMileage.reduce((sum, w) => sum + w.totalElevation, 0) * 3.28084)}ft
                </div>
                <div className="text-xs text-gray-500">Total Elevation</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
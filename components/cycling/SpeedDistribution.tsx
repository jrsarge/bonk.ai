'use client';

import { SpeedZone } from '@/lib/cycling/analysis';
import Card from '@/components/ui/Card';

interface SpeedDistributionProps {
  speedDistribution: SpeedZone[];
}

export function SpeedDistribution({ speedDistribution }: SpeedDistributionProps) {
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'recovery': return 'bg-green-500';
      case 'endurance': return 'bg-blue-500';
      case 'tempo': return 'bg-yellow-500';
      case 'threshold': return 'bg-orange-500';
      case 'vo2max': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getZoneDescription = (zone: string) => {
    switch (zone) {
      case 'recovery': return 'Easy recovery pace, active rest';
      case 'endurance': return 'Aerobic base building, comfortable effort';
      case 'tempo': return 'Steady effort, conversational pace';
      case 'threshold': return 'Lactate threshold, comfortably hard';
      case 'vo2max': return 'High intensity, near maximum effort';
      default: return '';
    }
  };

  const formatSpeed = (speed: number) => {
    if (speed === 0) return '--';
    return `${speed.toFixed(1)} mph`;
  };

  const totalDistance = speedDistribution.reduce((sum, zone) => sum + zone.distance, 0);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Training Intensity Distribution</h3>
        
        {totalDistance === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No speed distribution data available
          </div>
        ) : (
          <>
            {/* Visual distribution bar */}
            <div className="w-full h-8 rounded-lg overflow-hidden mb-6 flex">
              {speedDistribution.map((zone, index) => (
                <div
                  key={index}
                  className={`${getZoneColor(zone.zone)} h-full transition-all duration-300 hover:opacity-80`}
                  style={{
                    width: `${zone.percentage}%`
                  }}
                  title={`${zone.zone}: ${zone.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Zone breakdown */}
            <div className="space-y-3">
              {speedDistribution
                .filter(zone => zone.distance > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .map((zone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-4 h-4 rounded ${getZoneColor(zone.zone)}`}
                      />
                      <div>
                        <div className="font-medium capitalize">{zone.zone}</div>
                        <div className="text-xs text-gray-500">
                          {getZoneDescription(zone.zone)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{zone.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">
                        {zone.distance.toFixed(1)} mi
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Speed ranges */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Speed Zones</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {speedDistribution.map((zone, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="capitalize">{zone.zone}:</span>
                    <span className="text-gray-600">
                      {formatSpeed(zone.minSpeed)} - {formatSpeed(zone.maxSpeed)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training recommendation */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">💡 Training Tip</div>
              <div className="text-sm text-blue-800 mt-1">
                Aim for 60-70% endurance riding and 20-30% tempo/threshold work for optimal cycling fitness.
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
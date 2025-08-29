'use client';

import { PaceZone } from '@/lib/training/analysis';
import Card from '@/components/ui/Card';

interface PaceDistributionProps {
  paceDistribution: PaceZone[];
}

export function PaceDistribution({ paceDistribution }: PaceDistributionProps) {
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'easy': return 'bg-green-500';
      case 'tempo': return 'bg-yellow-500';
      case 'threshold': return 'bg-orange-500';
      case 'interval': return 'bg-red-500';
      case 'repetition': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getZoneDescription = (zone: string) => {
    switch (zone) {
      case 'easy': return 'Conversational pace, aerobic base building';
      case 'tempo': return 'Comfortably hard, marathon pace';
      case 'threshold': return 'Lactate threshold, 10K-15K pace';
      case 'interval': return 'VO2 max, 3K-5K pace';
      case 'repetition': return 'Neuromuscular power, mile pace';
      default: return '';
    }
  };

  const formatPace = (paceMinutes: number) => {
    if (paceMinutes === 0) return '--';
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalDistance = paceDistribution.reduce((sum, zone) => sum + zone.distance, 0);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Training Intensity Distribution</h3>
        
        {totalDistance === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No pace distribution data available
          </div>
        ) : (
          <>
            {/* Visual distribution bar */}
            <div className="w-full h-8 rounded-lg overflow-hidden mb-6 flex">
              {paceDistribution.map((zone, index) => (
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
              {paceDistribution
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

            {/* Pace ranges */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Pace Zones</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {paceDistribution.map((zone, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="capitalize">{zone.zone}:</span>
                    <span className="text-gray-600">
                      {zone.maxPace > 0 ? formatPace(zone.maxPace) : '--'} - {formatPace(zone.minPace)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training recommendation */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">💡 Training Tip</div>
              <div className="text-sm text-blue-800 mt-1">
                Aim for 80% easy running and 20% moderate-to-hard intensity for optimal training balance.
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
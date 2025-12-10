'use client';

import { HeartRateZone } from '@/lib/training/analysis';
import { StravaActivity } from '@/types/strava';
import Card from '@/components/ui/Card';
import { RunMapView } from './RunMapView';

interface PaceDistributionProps {
  heartRateZones: HeartRateZone[];
  activities: StravaActivity[];
}

export function PaceDistribution({ heartRateZones, activities }: PaceDistributionProps) {
  const getZoneColor = (zone: number) => {
    switch (zone) {
      case 1: return 'bg-blue-400';
      case 2: return 'bg-green-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getZoneDescription = (zone: number) => {
    switch (zone) {
      case 1: return 'Very light effort, warmup and cooldown';
      case 2: return 'Easy running, aerobic base building';
      case 3: return 'Moderate effort, marathon pace';
      case 4: return 'Hard effort, lactate threshold';
      case 5: return 'Maximum effort, VO2 max intervals';
      default: return '';
    }
  };

  // Safety check for undefined heartRateZones
  if (!heartRateZones || !Array.isArray(heartRateZones)) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Training Intensity Distribution</h3>
          <div className="text-center text-gray-500 py-8">
            <div className="mb-2">Loading heart rate data...</div>
          </div>
        </div>
      </Card>
    );
  }

  const hasHRData = heartRateZones.some(zone => zone.distance > 0);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Training Intensity Distribution</h3>

        {!hasHRData ? (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-2">No heart rate data available</div>
            <div className="text-xs">Activities need heart rate data to calculate training zones</div>
          </div>
        ) : (
          <>
            {/* Visual distribution bar */}
            <div className="w-full h-8 rounded-lg overflow-hidden mb-6 flex">
              {heartRateZones.map((zone, index) => (
                <div
                  key={index}
                  className={`${getZoneColor(zone.zone)} h-full transition-all duration-300 hover:opacity-80`}
                  style={{
                    width: `${zone.percentage}%`
                  }}
                  title={`Zone ${zone.zone}: ${zone.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Zone breakdown */}
            <div className="space-y-3">
              {heartRateZones
                .filter(zone => zone.distance > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .map((zone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded ${getZoneColor(zone.zone)}`}
                      />
                      <div>
                        <div className="font-medium">Zone {zone.zone}: {zone.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getZoneDescription(zone.zone)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">{zone.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {zone.distance.toFixed(1)} mi
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* HR ranges */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Heart Rate Zones</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {heartRateZones.map((zone, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="text-gray-600 dark:text-gray-400">Zone {zone.zone}:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {zone.minHR}-{zone.maxHR} bpm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Locations Map */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Run Locations</h4>
              <RunMapView activities={activities} />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
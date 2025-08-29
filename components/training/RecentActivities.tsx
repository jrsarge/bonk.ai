'use client';

import { StravaActivity } from '@/types/strava';
import Card from '@/components/ui/Card';

interface RecentActivitiesProps {
  activities: StravaActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return miles.toFixed(2);
  };

  const formatPace = (meters: number, seconds: number) => {
    const miles = meters * 0.000621371;
    const minutes = seconds / 60;
    const paceMinutes = miles > 0 ? minutes / miles : 0;
    
    const mins = Math.floor(paceMinutes);
    const secs = Math.round((paceMinutes - mins) * 60);
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}m`;
  };

  const getWorkoutTypeEmoji = (workoutType: number | undefined) => {
    switch (workoutType) {
      case 1: return '🏃‍♀️'; // Race
      case 2: return '🏃‍♂️'; // Long run
      case 3: return '💨'; // Workout (intervals/tempo)
      default: return '🔄'; // Easy run
    }
  };

  const getElevationColor = (elevation: number) => {
    if (elevation > 500) return 'text-red-600';
    if (elevation > 200) return 'text-orange-600';
    if (elevation > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No recent activities found
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {getWorkoutTypeEmoji(activity.workout_type)}
                      </span>
                      <h4 className="font-semibold text-gray-900 truncate">
                        {activity.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Distance</div>
                        <div className="font-medium">{formatDistance(activity.distance)} mi</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500">Pace</div>
                        <div className="font-medium">
                          {formatPace(activity.distance, activity.moving_time)}/mi
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500">Time</div>
                        <div className="font-medium">
                          {formatDuration(activity.moving_time)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500">Elevation</div>
                        <div className={`font-medium ${getElevationColor(activity.total_elevation_gain * 3.28084)}`}>
                          {Math.round(activity.total_elevation_gain * 3.28084)} ft
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional metrics for activities with heart rate */}
                    {activity.has_heartrate && activity.average_heartrate && (
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span>Avg HR: {Math.round(activity.average_heartrate)} bpm</span>
                        </div>
                        {activity.max_heartrate && (
                          <div className="flex items-center space-x-1">
                            <span>📈</span>
                            <span>Max: {Math.round(activity.max_heartrate)} bpm</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <div>{formatDate(activity.start_date)}</div>
                    <div>{formatTime(activity.start_date)}</div>
                  </div>
                </div>

                {/* Activity stats bar */}
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  {activity.kudos_count > 0 && (
                    <span className="flex items-center space-x-1">
                      <span>👍</span>
                      <span>{activity.kudos_count}</span>
                    </span>
                  )}
                  
                  {activity.achievement_count > 0 && (
                    <span className="flex items-center space-x-1">
                      <span>🏆</span>
                      <span>{activity.achievement_count}</span>
                    </span>
                  )}
                  
                  {activity.pr_count > 0 && (
                    <span className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{activity.pr_count} PR{activity.pr_count > 1 ? 's' : ''}</span>
                    </span>
                  )}

                  {activity.location_city && (
                    <span className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{activity.location_city}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {activities.length === 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing 10 most recent activities
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
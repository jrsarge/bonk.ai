'use client';

import { useApp } from '@/lib/auth/context';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { stravaAthlete, disconnectStrava, isStravaConnected } = useApp();

  if (!isStravaConnected || !stravaAthlete) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {stravaAthlete.profile_medium ? (
        <img 
          src={stravaAthlete.profile_medium} 
          alt={`${stravaAthlete.firstname} ${stravaAthlete.lastname}`}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {stravaAthlete.firstname?.[0] || ''}{stravaAthlete.lastname?.[0] || ''}
          </span>
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">
          {stravaAthlete.firstname} {stravaAthlete.lastname}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Connected to Strava
        </p>
      </div>
      <button
        onClick={disconnectStrava}
        className="text-sm text-red-600 hover:text-red-800 transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
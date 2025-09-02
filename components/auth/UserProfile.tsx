'use client';

import { useApp } from '@/lib/auth/context';
import Image from 'next/image';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { stravaAthlete, disconnectStrava, isStravaConnected, isGuestMode, connectStrava } = useApp();

  if (!isStravaConnected && !isGuestMode) {
    return null;
  }

  if (isGuestMode && !isStravaConnected) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">G</span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">Guest User</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Limited features</p>
        </div>
        <button
          onClick={connectStrava}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Connect Strava
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {stravaAthlete?.profile_medium ? (
        <Image 
          src={stravaAthlete.profile_medium} 
          alt={`${stravaAthlete.firstname} ${stravaAthlete.lastname}`}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {stravaAthlete?.firstname?.[0] || ''}{stravaAthlete?.lastname?.[0] || ''}
          </span>
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">
          {stravaAthlete?.firstname} {stravaAthlete?.lastname}
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
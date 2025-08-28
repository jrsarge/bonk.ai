'use client';

import { User } from '@/types';

interface UserProfileProps {
  user: User | null;
  className?: string;
}

export default function UserProfile({ user, className = '' }: UserProfileProps) {
  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {user.profilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={`${user.firstName} ${user.lastName}`}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>
      )}
      <div>
        <p className="font-medium text-gray-900 dark:text-white">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {user.email}
        </p>
      </div>
    </div>
  );
}
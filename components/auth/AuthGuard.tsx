'use client';

import { useApp } from '@/lib/auth/context';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/' 
}: AuthGuardProps) {
  const { isStravaConnected } = useApp();

  useEffect(() => {
    if (!isStravaConnected) {
      window.location.href = redirectTo;
    }
  }, [isStravaConnected, redirectTo]);

  if (!isStravaConnected) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="ml-4">Redirecting to connect Strava...</p>
      </div>
    );
  }

  return <>{children}</>;
}
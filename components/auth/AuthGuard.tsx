'use client';

import { useApp } from '@/lib/auth/context';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  allowGuest?: boolean;
}

export default function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/',
  allowGuest = false
}: AuthGuardProps) {
  const { isStravaConnected, isGuestMode } = useApp();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give a moment for context to initialize from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const isAuthorized = isStravaConnected || (allowGuest && isGuestMode);

  useEffect(() => {
    if (!isChecking && !isAuthorized) {
      window.location.href = redirectTo;
    }
  }, [isAuthorized, redirectTo, isChecking]);

  if (isChecking || !isAuthorized) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="ml-4">{isChecking ? 'Loading...' : 'Redirecting...'}</p>
      </div>
    );
  }

  return <>{children}</>;
}
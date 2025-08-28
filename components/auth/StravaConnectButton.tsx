'use client';

import { useState } from 'react';

interface StravaConnectButtonProps {
  className?: string;
  onConnect?: () => void;
}

export default function StravaConnectButton({ 
  className = '', 
  onConnect 
}: StravaConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    onConnect?.();
    
    // TODO: Implement actual Strava OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`bg-strava text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${className}`}
    >
      {isConnecting ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.916"/>
          </svg>
          <span>Connect with Strava</span>
        </>
      )}
    </button>
  );
}
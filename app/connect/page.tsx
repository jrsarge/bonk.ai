'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ConnectPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStravaConnect = () => {
    setIsConnecting(true);
    // This will be implemented with actual OAuth flow
    console.log('Connecting to Strava...');
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">bonk.ai</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-strava bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-strava" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.916"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your Strava Account
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                We need access to your Strava data to analyze your training history 
                and create personalized AI-powered training plans.
              </p>
            </div>

            {/* What we access */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What we&apos;ll access:
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Your running activities (last 12 weeks)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Distance, pace, and time data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Basic profile information (name, photo)</span>
                </div>
              </div>
            </div>

            {/* What we won't access */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What we won&apos;t access:
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Private activities or personal data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Non-running activities (cycling, swimming, etc.)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">GPS routes or detailed location data</span>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="text-center">
              <button
                onClick={handleStravaConnect}
                disabled={isConnecting}
                className="bg-strava text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
              >
                {isConnecting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.916"/>
                    </svg>
                    <span>Connect with Strava</span>
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                You&apos;ll be redirected to Strava to authorize the connection
              </p>
            </div>

            {/* Privacy note */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your data is encrypted and secure. We only use it to generate your training plans and never share it with third parties. You can revoke access at any time from your Strava settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StravaConnectButton } from '@/components/auth';
import { useApp } from '@/lib/auth/context';
import { Footer } from '@/components/ui';

const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export default function Home() {
  const { isStravaConnected, isGuestMode, enableGuestMode } = useApp();
  return (
    <div className="relative">
      {/* Background Image - Full height with proper cropping */}
      <div className="absolute inset-0 h-screen">
        <Image
          src="/home-page.jpg"
          alt="Aerial view of a woman running across a patterned brown and white checkered surface"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold text-white">bonk.ai</span>
            </div>
            {isStravaConnected ? (
              <Link
                href="/dashboard"
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <StravaConnectButton />
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Training Plans
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
              Never <span className="text-primary bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">bonk</span> again
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
              Get personalized 12-week training plans powered by AI and your Strava data. 
              Smart periodization that adapts to your fitness level and racing goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {isStravaConnected || isGuestMode ? (
                <Link
                  href="/dashboard"
                  className="group bg-primary hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
                >
                  <span className="flex items-center">
                    Go to Dashboard
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <StravaConnectButton className="group bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-2xl hover:shadow-blue-500/25 hover:scale-105" />
                  <button
                    onClick={async () => {
                      enableGuestMode();
                      // Small delay to ensure localStorage is set
                      await new Promise(resolve => setTimeout(resolve, 100));
                      window.location.href = '/dashboard';
                    }}
                    className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105"
                  >
                    <span className="flex items-center">
                      Continue as Guest
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              )}
              <button
                onClick={() => smoothScrollTo('features')}
                className="group border-2 border-white/80 hover:border-white text-white hover:bg-white hover:text-gray-900 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 backdrop-blur-sm hover:scale-105"
              >
                <span className="flex items-center">
                  Learn More
                  <svg className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </button>
            </div>
            
            {!(isStravaConnected || isGuestMode) && (
              <div className="text-center text-white/80 text-sm mb-6">
                <p className="mb-2">Connect Strava for personalized plans based on your data</p>
                <p>or continue as guest for basic plan generation</p>
              </div>
            )}
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Strava Integration
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                12-Week Programs
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                5K to 100 Mile Plans
              </div>
            </div>
          </div>
        </main>
        </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why Choose bonk.ai?
          </h2>

          {/* Features */}
          <div id="features" className="grid md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 p-8 rounded-2xl border border-blue-200 dark:border-blue-700/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Data-Driven Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Analyzes your last 12 weeks of Strava data to understand your current fitness and create personalized pace zones.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-8 rounded-2xl border border-green-200 dark:border-green-700/30 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">AI-Powered Plans</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Claude AI generates intelligent 12-week training plans tailored to your race distance and performance goals.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 p-8 rounded-2xl border border-orange-200 dark:border-orange-700/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Smart Periodization</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Proper training phases with build-up, peak, and taper periods to maximize performance while preventing injury.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

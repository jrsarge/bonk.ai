'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthGuard, UserProfile } from '@/components/auth';
import { useAuth } from '@/lib/auth/context';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">bonk.ai</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <UserProfile user={user} />
              <button 
                onClick={logout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to create your personalized training plan?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recent Activity
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Loading...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Analyzing your Strava data
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Weekly Mileage
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Loading...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Last 4 weeks average
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Training Plans
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              0
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Created plans
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Generate Your Training Plan
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="raceDistance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Race Distance
              </label>
              <select 
                id="raceDistance"
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a distance</option>
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half">Half Marathon</option>
                <option value="marathon">Marathon</option>
              </select>
            </div>

            <div>
              <label htmlFor="targetTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Time (optional)
              </label>
              <input 
                type="text"
                id="targetTime"
                placeholder="e.g., 1:30:00"
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              disabled={isLoading}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Plan...</span>
                </>
              ) : (
                <span>Generate Training Plan</span>
              )}
            </button>
          </div>
        </div>

        {/* Recent Plans (placeholder) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Training Plans
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No training plans yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generate your first AI-powered training plan to get started.
            </p>
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
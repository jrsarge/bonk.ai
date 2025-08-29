'use client';

import Link from 'next/link';
import { AuthGuard, UserProfile } from '@/components/auth';
import { useApp } from '@/lib/auth/context';
import { PlanGenerator } from '@/components/plans';

export default function Dashboard() {
  const { stravaAthlete, trainingPlans, exportTrainingPlans } = useApp();

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
              <UserProfile />
              <button 
                onClick={exportTrainingPlans}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Export Plans
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back{stravaAthlete?.firstname ? `, ${stravaAthlete.firstname}` : ''}!
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
              {trainingPlans.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Created plans
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <PlanGenerator onGenerate={(plan) => console.log('Generated plan:', plan)} />

        {/* Training Plans */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Training Plans
          </h2>
          {trainingPlans.length > 0 ? (
            <div className="space-y-4">
              {trainingPlans.map((plan) => (
                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {plan.raceDistance.toUpperCase()} Training Plan
                      </h3>
                      {plan.targetTime && (
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Target: {plan.targetTime}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.planData.weeks.length} weeks
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Peak: {Math.max(...plan.planData.weeks.map(w => w.totalDistance)).toFixed(0)} mi
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
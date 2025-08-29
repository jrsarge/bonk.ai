'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard, UserProfile } from '@/components/auth';
import { useApp } from '@/lib/auth/context';
import { PlanGenerator, PlanOverview, PlanExport } from '@/components/plans';
import { TrainingDashboard } from '@/components/training';
import { TrainingPlan, StoredPlan } from '@/types';
import { planStorage } from '@/lib/storage/plans';

export default function Dashboard() {
  const { stravaAthlete } = useApp();
  const [storedPlans, setStoredPlans] = useState<StoredPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'plans' | 'current'>('current');

  // Load plans from localStorage on component mount
  useEffect(() => {
    const plans = planStorage.getAllPlans();
    setStoredPlans(plans);
    
    // Set active plan if available
    const activePlan = planStorage.getActivePlan();
    if (activePlan && plans.length > 0) {
      setSelectedPlan(activePlan);
      setActiveTab('current');
    } else if (plans.length > 0) {
      setActiveTab('plans');
    } else {
      setActiveTab('generate');
    }
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const plans = planStorage.getAllPlans();
      setStoredPlans(plans);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePlanGenerated = (plan: TrainingPlan) => {
    const plans = planStorage.getAllPlans();
    setStoredPlans(plans);
    setSelectedPlan(plan);
    setActiveTab('current');
  };

  const handlePlanSelect = (planId: string) => {
    const storedPlan = planStorage.getPlan(planId);
    if (storedPlan) {
      setSelectedPlan(storedPlan.plan);
      planStorage.setActivePlan(storedPlan.plan);
      setActiveTab('current');
    }
  };

  const formatRaceDistance = (distance: string): string => {
    switch (distance) {
      case '5k': return '5K';
      case '10k': return '10K';  
      case 'half': return 'Half Marathon';
      case 'marathon': return 'Marathon';
      default: return distance.toUpperCase();
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">bonk.ai</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <UserProfile />
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
              Your AI-powered training analysis and plan generation hub.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {selectedPlan && (
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'current'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Current Plan
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'generate'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Generate Plan
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'plans'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  All Plans ({storedPlans.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'current' && selectedPlan && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your {formatRaceDistance(selectedPlan.raceDistance)} Training Plan
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Generated {new Date(selectedPlan.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <PlanExport plan={selectedPlan} />
              </div>
              <PlanOverview plan={selectedPlan} />
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-8">
              <TrainingDashboard />
              <PlanGenerator onGenerate={handlePlanGenerated} />
            </div>
          )}

          {activeTab === 'plans' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Training Plans
                </h2>
                {storedPlans.length > 0 && (
                  <button
                    onClick={() => planStorage.clearAllPlans()}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Clear All Plans
                  </button>
                )}
              </div>
              
              {storedPlans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {storedPlans.map((storedPlan) => {
                    const { plan } = storedPlan;
                    const stats = planStorage.getPlanStats(plan.id);
                    
                    return (
                      <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {formatRaceDistance(plan.raceDistance)}
                            </h3>
                            {plan.targetTime && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Target: {plan.targetTime}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {stats.completionPercentage}% complete
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${stats.completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Weeks:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {plan.summary.totalWeeks}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Peak:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {plan.summary.peakWeeklyMileage.toFixed(0)} mi
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Created: {new Date(storedPlan.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlanSelect(plan.id)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            View Plan
                          </button>
                          <button
                            onClick={() => planStorage.deletePlan(plan.id)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Generate your first AI-powered training plan to get started.
                  </p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Generate Plan
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
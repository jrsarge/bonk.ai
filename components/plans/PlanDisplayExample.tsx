'use client';

import { useState, useEffect } from 'react';
import PlanDisplayLayout from './PlanDisplayLayout';
import { planStorage } from '@/lib/storage/plans';
import { TrainingPlan } from '@/types';

/**
 * Example component showing how to integrate the new plan display system
 * This demonstrates loading a plan and displaying it with the enhanced UI
 */
export default function PlanDisplayExample() {
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load all available plans
    const loadPlans = () => {
      const storedPlans = planStorage.getAllPlans();
      const plans = storedPlans.map(stored => stored.plan);
      setAvailablePlans(plans);
      
      // Auto-select the most recent plan
      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
      }
      
      setIsLoading(false);
    };

    loadPlans();
    
    // Listen for storage changes to update plans list
    const handleStorageChange = () => loadPlans();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (availablePlans.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Training Plans Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create your first AI-generated training plan to get started.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Generate New Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan selector */}
      {availablePlans.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Training Plan
          </label>
          <select
            value={selectedPlan?.id || ''}
            onChange={(e) => {
              const plan = availablePlans.find(p => p.id === e.target.value);
              setSelectedPlan(plan || null);
            }}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {availablePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.raceDistance.toUpperCase()} Plan - Generated {new Date(plan.generatedAt).toLocaleDateString()}
                {plan.targetTime && ` (Target: ${plan.targetTime})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Plan display */}
      {selectedPlan && (
        <PlanDisplayLayout 
          plan={selectedPlan} 
          className="animate-fadeIn"
        />
      )}
    </div>
  );
}

/**
 * Minimal usage example for when you already have a plan object
 */
export function SimplePlanDisplay({ plan }: { plan: TrainingPlan }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <PlanDisplayLayout plan={plan} />
    </div>
  );
}
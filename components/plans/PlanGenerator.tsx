'use client';

import { useState } from 'react';
import { useApp } from '@/lib/auth/context';
import { RaceDistance, TrainingPlan, PlanGenerationResponse } from '@/types';
import { planStorage } from '@/lib/storage/plans';

interface PlanGeneratorProps {
  onGenerate?: (plan: TrainingPlan) => void;
}

export default function PlanGenerator({ onGenerate }: PlanGeneratorProps) {
  const { stravaAccessToken } = useApp();
  const [raceDistance, setRaceDistance] = useState<RaceDistance | ''>('');
  const [targetTime, setTargetTime] = useState('');
  const [trainingDays, setTrainingDays] = useState(5);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [currentMileage, setCurrentMileage] = useState('');
  const [dateMode, setDateMode] = useState<'auto' | 'start' | 'end'>('auto');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!raceDistance) return;
    
    setIsGenerating(true);
    setError('');
    setGenerationStep('Fetching your Strava data...');
    
    try {
      let stravaActivities = [];
      
      if (stravaAccessToken) {
        try {
          const activitiesResponse = await fetch('/api/strava/activities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: stravaAccessToken }),
          });
          
          if (activitiesResponse.ok) {
            const data = await activitiesResponse.json();
            stravaActivities = data.activities;
          }
        } catch (error) {
          console.warn('Failed to fetch Strava activities:', error);
        }
      }
      
      setGenerationStep('Analyzing your training data...');
      
      // Small delay to show the step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGenerationStep('Generating your personalized plan...');
      
      const planResponse = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raceDistance: raceDistance as RaceDistance,
          targetTime: targetTime || undefined,
          stravaActivities,
          trainingDays,
          experience,
          currentMileage: currentMileage ? parseInt(currentMileage) : undefined,
          datePreferences: {
            mode: dateMode,
            startDate: customStartDate || undefined,
            endDate: customEndDate || undefined
          },
          preferences: {
            includeSpeedWork: true
          }
        }),
      });
      
      const data = await planResponse.json() as PlanGenerationResponse;
      
      if (data.success && data.plan) {
        setGenerationStep('Finalizing your plan...');
        
        // Save to localStorage
        planStorage.savePlan(data.plan);
        planStorage.setActivePlan(data.plan);
        
        onGenerate?.(data.plan);
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (error) {
      console.error('Plan generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate training plan. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Generate Your AI Training Plan
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="raceDistance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Race Distance *
          </label>
          <select 
            id="raceDistance"
            value={raceDistance}
            onChange={(e) => setRaceDistance(e.target.value as RaceDistance | '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            placeholder="e.g., 1:30:00 for half marathon"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trainingDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Training Days per Week
            </label>
            <select 
              id="trainingDays"
              value={trainingDays}
              onChange={(e) => setTrainingDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={3}>3 days</option>
              <option value={4}>4 days</option>
              <option value={5}>5 days</option>
              <option value={6}>6 days</option>
            </select>
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Running Experience
            </label>
            <select 
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="beginner">Beginner (0-2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="currentMileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Weekly Mileage (optional)
          </label>
          <input 
            type="number"
            id="currentMileage"
            value={currentMileage}
            onChange={(e) => setCurrentMileage(e.target.value)}
            placeholder="e.g., 20"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave blank to use Strava data analysis
          </p>
        </div>

        <div>
          <label htmlFor="dateMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plan Timing
          </label>
          <div className="space-y-3">
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateMode"
                  value="auto"
                  checked={dateMode === 'auto'}
                  onChange={(e) => setDateMode(e.target.value as 'auto')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto (starts next Monday)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateMode"
                  value="start"
                  checked={dateMode === 'start'}
                  onChange={(e) => setDateMode(e.target.value as 'start')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Choose start date
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dateMode"
                  value="end"
                  checked={dateMode === 'end'}
                  onChange={(e) => setDateMode(e.target.value as 'end')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Choose race/goal date
                </span>
              </label>
            </div>
            
            {dateMode === 'start' && (
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            
            {dateMode === 'end' && (
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Race/Goal Date (plan ends here)
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={new Date(new Date().getTime() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Plan will work backwards from this date (minimum 12 weeks from now)
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!raceDistance || isGenerating}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{generationStep || 'Generating Plan...'}</span>
            </>
          ) : (
            <span>Generate AI Training Plan</span>
          )}
        </button>
        
        {stravaAccessToken && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Your Strava data will be used to personalize your plan
          </p>
        )}
      </div>
    </div>
  );
}
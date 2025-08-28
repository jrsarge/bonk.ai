'use client';

import { useState } from 'react';
import { RaceDistance } from '@/types';

interface PlanGeneratorProps {
  onGenerate?: (params: { raceDistance: RaceDistance; targetTime?: string }) => void;
}

export default function PlanGenerator({ onGenerate }: PlanGeneratorProps) {
  const [raceDistance, setRaceDistance] = useState<RaceDistance | ''>('');
  const [targetTime, setTargetTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!raceDistance) return;
    
    setIsGenerating(true);
    onGenerate?.({
      raceDistance: raceDistance as RaceDistance,
      targetTime: targetTime || undefined
    });
    
    // TODO: Implement actual plan generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
            value={raceDistance}
            onChange={(e) => setRaceDistance(e.target.value as RaceDistance | '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
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
            placeholder="e.g., 1:30:00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!raceDistance || isGenerating}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
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
  );
}
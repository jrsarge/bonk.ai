'use client';

import { useState, useEffect, useCallback } from 'react';
import { StravaActivity } from '@/types/strava';
import { TrainingAnalysis, TrainingAnalyzer } from './analysis';
import { useApp } from '@/lib/auth/context';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getCacheKey = (weeks: number) => `training_analysis_${weeks}w`;
const getActivitiesCacheKey = (weeks: number) => `strava_activities_${weeks}w`;

interface AnalysisHookReturn {
  analysis: TrainingAnalysis | null;
  activities: StravaActivity[];
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: (weeks?: number) => Promise<void>;
  lastFetched: Date | null;
}

export function useTrainingAnalysis(initialWeeks = 12): AnalysisHookReturn {
  const { stravaAccessToken } = useApp();
  const [weeks, setWeeks] = useState(initialWeeks);
  const [analysis, setAnalysis] = useState<TrainingAnalysis | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const loadCachedData = useCallback((weeksToLoad: number) => {
    try {
      // Load cached analysis
      const cachedAnalysis = localStorage.getItem(getCacheKey(weeksToLoad));
      if (cachedAnalysis) {
        const parsed = JSON.parse(cachedAnalysis);
        setAnalysis({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          weeklyMileage: parsed.weeklyMileage.map((week: { weekStart: string; weekEnd: string; totalDistance: number; runCount: number }) => ({
            ...week,
            weekStart: new Date(week.weekStart),
            weekEnd: new Date(week.weekEnd)
          }))
        });
      }

      // Load cached activities
      const cachedActivities = localStorage.getItem(getActivitiesCacheKey(weeksToLoad));
      if (cachedActivities) {
        const parsed = JSON.parse(cachedActivities);
        setActivities(parsed.data || []);
        setLastFetched(parsed.timestamp ? new Date(parsed.timestamp) : null);
      }
    } catch (err) {
      console.error('Error loading cached training data:', err);
    }
  }, []);

  const shouldRefreshData = useCallback((): boolean => {
    if (!lastFetched) return true;
    
    const now = Date.now();
    const cacheAge = now - lastFetched.getTime();
    
    return cacheAge > CACHE_DURATION;
  }, [lastFetched]);

  const fetchActivities = useCallback(async (weeksToFetch: number): Promise<StravaActivity[]> => {
    if (!stravaAccessToken) {
      throw new Error('Strava access token not available');
    }

    const response = await fetch('/api/strava/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: stravaAccessToken,
        weeks: weeksToFetch
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.activities || [];
  }, [stravaAccessToken]);

  const cacheData = useCallback((activities: StravaActivity[], analysis: TrainingAnalysis, weeksToCache: number) => {
    try {
      // Cache activities with timestamp
      localStorage.setItem(getActivitiesCacheKey(weeksToCache), JSON.stringify({
        data: activities,
        timestamp: new Date().toISOString()
      }));

      // Cache analysis
      localStorage.setItem(getCacheKey(weeksToCache), JSON.stringify(analysis));
    } catch (err) {
      console.error('Error caching training data:', err);
    }
  }, []);

  const refreshAnalysis = useCallback(async (newWeeks?: number): Promise<void> => {
    if (!stravaAccessToken) {
      setError('Strava access token not available');
      return;
    }

    // Update weeks if provided
    const weeksToFetch = newWeeks ?? weeks;
    if (newWeeks !== undefined) {
      setWeeks(newWeeks);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch fresh activities
      const freshActivities = await fetchActivities(weeksToFetch);
      setActivities(freshActivities);

      // Generate analysis
      const analyzer = new TrainingAnalyzer(freshActivities);
      const freshAnalysis = analyzer.analyze();
      setAnalysis(freshAnalysis);

      // Update last fetched time
      const now = new Date();
      setLastFetched(now);

      // Cache the results with the weeks parameter
      cacheData(freshActivities, freshAnalysis, weeksToFetch);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch training data';
      setError(errorMessage);
      console.error('Training analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stravaAccessToken, weeks, fetchActivities, cacheData]);

  // Load cached data on mount and when weeks change
  useEffect(() => {
    loadCachedData(weeks);
  }, [loadCachedData, weeks]);

  // Auto-refresh when token is available and cache is stale
  useEffect(() => {
    if (stravaAccessToken && shouldRefreshData()) {
      refreshAnalysis(weeks);
    }
  }, [stravaAccessToken, shouldRefreshData, refreshAnalysis, weeks]);

  return {
    analysis,
    activities,
    isLoading,
    error,
    refreshAnalysis,
    lastFetched,
  };
}
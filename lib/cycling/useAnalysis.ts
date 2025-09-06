'use client';

import { useState, useEffect, useCallback } from 'react';
import { StravaActivity } from '@/types/strava';
import { CyclingAnalysis, CyclingAnalyzer } from './analysis';
import { useApp } from '@/lib/auth/context';

const CACHE_KEY = 'cycling_analysis';
const ACTIVITIES_CACHE_KEY = 'strava_cycling_activities';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CyclingAnalysisHookReturn {
  analysis: CyclingAnalysis | null;
  activities: StravaActivity[];
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: () => Promise<void>;
  lastFetched: Date | null;
}

export function useCyclingAnalysis(): CyclingAnalysisHookReturn {
  const { stravaAccessToken } = useApp();
  const [analysis, setAnalysis] = useState<CyclingAnalysis | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const loadCachedData = useCallback(() => {
    try {
      // Load cached analysis
      const cachedAnalysis = localStorage.getItem(CACHE_KEY);
      if (cachedAnalysis) {
        const parsed = JSON.parse(cachedAnalysis);
        setAnalysis({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          weeklyMileage: parsed.weeklyMileage.map((week: { weekStart: string; weekEnd: string; }) => ({
            ...week,
            weekStart: new Date(week.weekStart),
            weekEnd: new Date(week.weekEnd)
          }))
        });
      }

      // Load cached activities
      const cachedActivities = localStorage.getItem(ACTIVITIES_CACHE_KEY);
      if (cachedActivities) {
        const parsed = JSON.parse(cachedActivities);
        setActivities(parsed.data || []);
        setLastFetched(parsed.timestamp ? new Date(parsed.timestamp) : null);
      }
    } catch (err) {
      console.error('Error loading cached cycling data:', err);
    }
  }, []);

  const shouldRefreshData = useCallback((): boolean => {
    if (!lastFetched) return true;
    
    const now = Date.now();
    const cacheAge = now - lastFetched.getTime();
    
    return cacheAge > CACHE_DURATION;
  }, [lastFetched]);

  const fetchActivities = useCallback(async (): Promise<StravaActivity[]> => {
    if (!stravaAccessToken) {
      throw new Error('Strava access token not available');
    }

    const response = await fetch('/api/strava/cycling', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: stravaAccessToken,
        weeks: 12
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.activities || [];
  }, [stravaAccessToken]);

  const cacheData = useCallback((activities: StravaActivity[], analysis: CyclingAnalysis) => {
    try {
      // Cache activities with timestamp
      localStorage.setItem(ACTIVITIES_CACHE_KEY, JSON.stringify({
        data: activities,
        timestamp: new Date().toISOString()
      }));

      // Cache analysis
      localStorage.setItem(CACHE_KEY, JSON.stringify(analysis));
    } catch (err) {
      console.error('Error caching cycling data:', err);
    }
  }, []);

  const refreshAnalysis = useCallback(async (): Promise<void> => {
    if (!stravaAccessToken) {
      setError('Strava access token not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch fresh activities
      const freshActivities = await fetchActivities();
      setActivities(freshActivities);

      // Generate analysis
      const analyzer = new CyclingAnalyzer(freshActivities);
      const freshAnalysis = analyzer.analyze();
      setAnalysis(freshAnalysis);

      // Update last fetched time
      const now = new Date();
      setLastFetched(now);

      // Cache the results
      cacheData(freshActivities, freshAnalysis);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cycling data';
      setError(errorMessage);
      console.error('Cycling analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stravaAccessToken, fetchActivities, cacheData]);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // Auto-refresh when token is available and cache is stale
  useEffect(() => {
    if (stravaAccessToken && shouldRefreshData()) {
      refreshAnalysis();
    }
  }, [stravaAccessToken, shouldRefreshData, refreshAnalysis]);

  return {
    analysis,
    activities,
    isLoading,
    error,
    refreshAnalysis,
    lastFetched,
  };
}
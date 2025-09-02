'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { TrainingPlan } from '@/types';
import { StravaAthlete } from '@/types/strava';

interface AppContextType {
  stravaAthlete: StravaAthlete | null;
  stravaAccessToken: string | null;
  trainingPlans: TrainingPlan[];
  isStravaConnected: boolean;
  isGuestMode: boolean;
  connectStrava: () => void;
  disconnectStrava: () => void;
  enableGuestMode: () => void;
  saveTrainingPlan: (plan: TrainingPlan) => void;
  deleteTrainingPlan: (planId: string) => void;
  exportTrainingPlans: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stravaAthlete, setStravaAthlete] = useState<StravaAthlete | null>(null);
  const [stravaAccessToken, setStravaAccessToken] = useState<string | null>(null);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  useEffect(() => {
    const savedAthlete = localStorage.getItem('strava_athlete');
    const savedToken = localStorage.getItem('strava_access_token');
    const savedPlans = localStorage.getItem('training_plans');
    const savedGuestMode = localStorage.getItem('guest_mode') === 'true';

    if (savedAthlete) {
      setStravaAthlete(JSON.parse(savedAthlete));
    }
    if (savedToken) {
      setStravaAccessToken(savedToken);
    }
    if (savedPlans) {
      setTrainingPlans(JSON.parse(savedPlans));
    }
    if (savedGuestMode) {
      setIsGuestMode(true);
    }
  }, []);

  // Listen for auth state changes to update context when OAuth completes
  useEffect(() => {
    const handleAuthStateChange = (e: CustomEvent) => {
      if (e.detail.type === 'strava_connected') {
        setStravaAthlete(e.detail.athlete);
        setStravaAccessToken(e.detail.accessToken);
        setIsGuestMode(false);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    return () => window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
  }, []);

  const connectStrava = () => {
    // Set redirect preference to dashboard after OAuth
    localStorage.setItem('oauth_redirect', 'dashboard');
    // Don't clear guest mode here - let the connect page handle it after successful OAuth
    window.location.href = '/api/auth/strava';
  };

  const disconnectStrava = () => {
    localStorage.removeItem('strava_athlete');
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('guest_mode');
    setStravaAthlete(null);
    setStravaAccessToken(null);
    setIsGuestMode(false);
  };

  const enableGuestMode = () => {
    localStorage.setItem('guest_mode', 'true');
    setIsGuestMode(true);
  };

  const saveTrainingPlan = (plan: TrainingPlan) => {
    const updatedPlans = [...trainingPlans.filter(p => p.id !== plan.id), plan];
    setTrainingPlans(updatedPlans);
    localStorage.setItem('training_plans', JSON.stringify(updatedPlans));
  };

  const deleteTrainingPlan = (planId: string) => {
    const updatedPlans = trainingPlans.filter(p => p.id !== planId);
    setTrainingPlans(updatedPlans);
    localStorage.setItem('training_plans', JSON.stringify(updatedPlans));
  };

  const exportTrainingPlans = () => {
    const dataStr = JSON.stringify(trainingPlans, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bonk-training-plans-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isStravaConnected = !!(stravaAthlete && stravaAccessToken);

  const value = {
    stravaAthlete,
    stravaAccessToken,
    trainingPlans,
    isStravaConnected,
    isGuestMode,
    connectStrava,
    disconnectStrava,
    enableGuestMode,
    saveTrainingPlan,
    deleteTrainingPlan,
    exportTrainingPlans,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
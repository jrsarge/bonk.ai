'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { TrainingPlan } from '@/types';
import { StravaAthlete } from '@/types/strava';

interface AppContextType {
  stravaAthlete: StravaAthlete | null;
  stravaAccessToken: string | null;
  trainingPlans: TrainingPlan[];
  isStravaConnected: boolean;
  connectStrava: () => void;
  disconnectStrava: () => void;
  saveTrainingPlan: (plan: TrainingPlan) => void;
  deleteTrainingPlan: (planId: string) => void;
  exportTrainingPlans: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stravaAthlete, setStravaAthlete] = useState<StravaAthlete | null>(null);
  const [stravaAccessToken, setStravaAccessToken] = useState<string | null>(null);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);

  useEffect(() => {
    const savedAthlete = localStorage.getItem('strava_athlete');
    const savedToken = localStorage.getItem('strava_access_token');
    const savedPlans = localStorage.getItem('training_plans');

    if (savedAthlete) {
      setStravaAthlete(JSON.parse(savedAthlete));
    }
    if (savedToken) {
      setStravaAccessToken(savedToken);
    }
    if (savedPlans) {
      setTrainingPlans(JSON.parse(savedPlans));
    }
  }, []);

  const connectStrava = () => {
    window.location.href = '/api/auth/strava';
  };

  const disconnectStrava = () => {
    localStorage.removeItem('strava_athlete');
    localStorage.removeItem('strava_access_token');
    setStravaAthlete(null);
    setStravaAccessToken(null);
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
    connectStrava,
    disconnectStrava,
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
'use client';

import { useState, useEffect } from 'react';
import { TrainingPlan } from '@/types';
import PlanOverview from './PlanOverview';
import WeekView from './WeekView';
import DayView from './DayView';
import PlanExport from './PlanExport';
import { planStorage } from '@/lib/storage/plans';

interface PlanDisplayLayoutProps {
  plan: TrainingPlan;
  className?: string;
}

type ViewMode = 'overview' | 'week' | 'day';

interface ViewState {
  mode: ViewMode;
  weekNumber?: number;
  dayNumber?: number;
}

export default function PlanDisplayLayout({ plan, className = '' }: PlanDisplayLayoutProps) {
  const [viewState, setViewState] = useState<ViewState>({ mode: 'overview' });
  const [planStats, setPlanStats] = useState(planStorage.getPlanStats(plan.id));

  useEffect(() => {
    const handleStorageChange = () => {
      setPlanStats(planStorage.getPlanStats(plan.id));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [plan.id]);

  const navigateToWeek = (weekNumber: number) => {
    setViewState({ mode: 'week', weekNumber });
  };

  const navigateToDay = (weekNumber: number, dayNumber: number) => {
    setViewState({ mode: 'day', weekNumber, dayNumber });
  };

  const navigateBack = () => {
    if (viewState.mode === 'day') {
      setViewState({ mode: 'week', weekNumber: viewState.weekNumber });
    } else if (viewState.mode === 'week') {
      setViewState({ mode: 'overview' });
    }
  };

  const navigateToOverview = () => {
    setViewState({ mode: 'overview' });
  };

  const currentWeek = plan.weeks.find(w => w.weekNumber === viewState.weekNumber);
  const currentWorkout = currentWeek?.workouts.find(w => w.day === viewState.dayNumber);

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header with navigation and actions */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Back button */}
            {viewState.mode !== 'overview' && (
              <button
                onClick={navigateBack}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Title and breadcrumb */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <button
                  onClick={navigateToOverview}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                    viewState.mode === 'overview' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
                  }`}
                >
                  Plan Overview
                </button>
                {viewState.mode === 'week' && (
                  <>
                    <span>/</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Week {viewState.weekNumber}
                    </span>
                  </>
                )}
                {viewState.mode === 'day' && (
                  <>
                    <span>/</span>
                    <button
                      onClick={() => navigateToWeek(viewState.weekNumber!)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Week {viewState.weekNumber}
                    </button>
                    <span>/</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Day {viewState.dayNumber}
                    </span>
                  </>
                )}
              </div>
              
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {viewState.mode === 'overview' && `${plan.raceDistance.toUpperCase()} Training Plan`}
                {viewState.mode === 'week' && `Week ${viewState.weekNumber}${currentWeek ? `: ${currentWeek.theme}` : ''}`}
                {viewState.mode === 'day' && currentWorkout && `${currentWorkout.name}`}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Plan stats */}
            <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{planStats.totalWorkouts} workouts</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <span>Week {planStats.currentWeek}</span>
              </div>
            </div>

            {/* Export button */}
            <PlanExport plan={plan} />
          </div>
        </div>

        {/* Mobile progress indicator */}
        <div className="md:hidden mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{planStats.completedWorkouts} done</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <span>{planStats.totalWorkouts - planStats.completedWorkouts} left</span>
            </div>
          </div>
          <div className="text-blue-600 dark:text-blue-400 font-medium">
            {planStats.completionPercentage}% complete
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${planStats.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="space-y-6">
        {viewState.mode === 'overview' && (
          <PlanOverview
            plan={plan}
            onWeekSelect={navigateToWeek}
            className="animate-fadeIn"
          />
        )}

        {viewState.mode === 'week' && viewState.weekNumber && (
          <WeekView
            plan={plan}
            weekNumber={viewState.weekNumber}
            onDaySelect={(dayNumber) => navigateToDay(viewState.weekNumber!, dayNumber)}
            onBackToOverview={navigateToOverview}
            className="animate-fadeIn"
          />
        )}

        {viewState.mode === 'day' && viewState.weekNumber && viewState.dayNumber && (
          <DayView
            plan={plan}
            weekNumber={viewState.weekNumber}
            dayNumber={viewState.dayNumber}
            onBackToWeek={() => navigateToWeek(viewState.weekNumber!)}
            onNavigateDay={(direction) => {
              const currentWeekIndex = plan.weeks.findIndex(w => w.weekNumber === viewState.weekNumber);
              const currentWeek = plan.weeks[currentWeekIndex];
              const currentDayIndex = currentWeek.workouts.findIndex(w => w.day === viewState.dayNumber);
              
              if (direction === 'prev' && currentDayIndex > 0) {
                setViewState({
                  mode: 'day',
                  weekNumber: viewState.weekNumber,
                  dayNumber: currentWeek.workouts[currentDayIndex - 1].day
                });
              } else if (direction === 'prev' && currentWeekIndex > 0) {
                const prevWeek = plan.weeks[currentWeekIndex - 1];
                const lastWorkout = prevWeek.workouts[prevWeek.workouts.length - 1];
                setViewState({
                  mode: 'day',
                  weekNumber: prevWeek.weekNumber,
                  dayNumber: lastWorkout.day
                });
              } else if (direction === 'next' && currentDayIndex < currentWeek.workouts.length - 1) {
                setViewState({
                  mode: 'day',
                  weekNumber: viewState.weekNumber,
                  dayNumber: currentWeek.workouts[currentDayIndex + 1].day
                });
              } else if (direction === 'next' && currentWeekIndex < plan.weeks.length - 1) {
                const nextWeek = plan.weeks[currentWeekIndex + 1];
                setViewState({
                  mode: 'day',
                  weekNumber: nextWeek.weekNumber,
                  dayNumber: nextWeek.workouts[0].day
                });
              }
            }}
            className="animate-fadeIn"
          />
        )}
      </div>
    </div>
  );
}
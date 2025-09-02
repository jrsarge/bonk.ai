'use client';

import { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TimePicker({ value, onChange, placeholder = "Select time", className = "" }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Parse the incoming value when it changes
  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        setHours(parseInt(parts[0]) || 0);
        setMinutes(parseInt(parts[1]) || 0);
        setSeconds(parseInt(parts[2]) || 0);
      }
    }
  }, [value]);

  // Format time as HH:MM:SS
  const formatTime = (h: number, m: number, s: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (newHours: number, newMinutes: number, newSeconds: number) => {
    setHours(newHours);
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    onChange(formatTime(newHours, newMinutes, newSeconds));
  };

  const displayValue = value || placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {displayValue}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center items-center space-x-4">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Hours</label>
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      type="button"
                      onClick={() => handleTimeChange(Math.min(hours + 1, 48), minutes, seconds)}
                      className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      ▲
                    </button>
                    <div className="w-12 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-lg font-mono">
                      {hours.toString().padStart(2, '0')}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTimeChange(Math.max(hours - 1, 0), minutes, seconds)}
                      className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-400">:</div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Minutes</label>
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      type="button"
                      onClick={() => handleTimeChange(hours, Math.min(minutes + 1, 59), seconds)}
                      className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      ▲
                    </button>
                    <div className="w-12 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-lg font-mono">
                      {minutes.toString().padStart(2, '0')}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTimeChange(hours, Math.max(minutes - 1, 0), seconds)}
                      className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-400">:</div>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Seconds</label>
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      type="button"
                      onClick={() => handleTimeChange(hours, minutes, Math.min(seconds + 1, 59))}
                      className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      ▲
                    </button>
                    <div className="w-12 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-lg font-mono">
                      {seconds.toString().padStart(2, '0')}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTimeChange(hours, minutes, Math.max(seconds - 1, 0))}
                      className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setHours(0);
                    setMinutes(0);
                    setSeconds(0);
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
'use client';

import { TrainingWeek } from '@/types';
import { useState } from 'react';

interface WeeklyMileageChartProps {
  weeks: TrainingWeek[];
  className?: string;
}

export default function WeeklyMileageChart({ weeks, className = '' }: WeeklyMileageChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  if (!weeks || weeks.length === 0) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No weekly data available</p>
      </div>
    );
  }

  const maxMileage = Math.max(...weeks.map(w => w.totalDistance));
  const minMileage = Math.min(...weeks.map(w => w.totalDistance));
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 60;
  const plotWidth = chartWidth - (padding * 2);
  const plotHeight = chartHeight - (padding * 2);

  // Calculate points for the line
  const points = weeks.map((week, index) => {
    const x = padding + (index * plotWidth) / (weeks.length - 1);
    const y = padding + plotHeight - ((week.totalDistance - minMileage) / (maxMileage - minMileage)) * plotHeight;
    return { x, y, week };
  });

  // Generate y-axis ticks
  const yTicks = [];
  const tickCount = 6;
  for (let i = 0; i <= tickCount; i++) {
    const value = minMileage + (i * (maxMileage - minMileage)) / tickCount;
    const y = padding + plotHeight - (i * plotHeight) / tickCount;
    yTicks.push({ value: Math.round(value * 10) / 10, y });
  }

  // Generate x-axis ticks
  const xTicks = weeks.map((week, index) => {
    const x = padding + (index * plotWidth) / (weeks.length - 1);
    return { value: week.weekNumber, x };
  });

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Weekly Mileage Progression
      </h3>
      
      <div className="w-full overflow-x-auto flex justify-center">
        <svg width={chartWidth} height={chartHeight} className="bg-white dark:bg-gray-700 rounded-lg">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-600" opacity="0.3"/>
            </pattern>
          </defs>
          
          {/* Y-axis grid lines */}
          {yTicks.map((tick, index) => (
            <line
              key={`y-grid-${index}`}
              x1={padding}
              y1={tick.y}
              x2={padding + plotWidth}
              y2={tick.y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-gray-600"
              opacity="0.3"
            />
          ))}
          
          {/* X-axis grid lines */}
          {xTicks.map((tick, index) => (
            <line
              key={`x-grid-${index}`}
              x1={tick.x}
              y1={padding}
              x2={tick.x}
              y2={padding + plotHeight}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-gray-600"
              opacity="0.3"
            />
          ))}
          
          {/* Y-axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + plotHeight}
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400 dark:text-gray-500"
          />
          
          {/* X-axis */}
          <line
            x1={padding}
            y1={padding + plotHeight}
            x2={padding + plotWidth}
            y2={padding + plotHeight}
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400 dark:text-gray-500"
          />
          
          {/* Y-axis labels */}
          {yTicks.map((tick, index) => (
            <text
              key={`y-label-${index}`}
              x={padding - 10}
              y={tick.y + 5}
              textAnchor="end"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              style={{ fontSize: '12px' }}
            >
              {tick.value}
            </text>
          ))}
          
          {/* X-axis labels */}
          {xTicks.map((tick, index) => (
            <text
              key={`x-label-${index}`}
              x={tick.x}
              y={padding + plotHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              style={{ fontSize: '12px' }}
            >
              {tick.value}
            </text>
          ))}
          
          {/* Axis labels */}
          <text
            x={padding / 2}
            y={padding + plotHeight / 2}
            textAnchor="middle"
            className="text-sm fill-gray-700 dark:fill-gray-300"
            style={{ fontSize: '14px' }}
            transform={`rotate(-90, ${padding / 2}, ${padding + plotHeight / 2})`}
          >
            Miles
          </text>
          
          <text
            x={padding + plotWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-sm fill-gray-700 dark:fill-gray-300"
            style={{ fontSize: '14px' }}
          >
            Week
          </text>
          
          {/* Line path */}
          <path
            d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
            fill="none"
            stroke="rgb(37, 99, 235)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-200"
            style={{
              filter: hoveredPoint !== null ? 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.4))' : 'none'
            }}
          />
          
          {/* Hover line indicator */}
          {hoveredPoint !== null && (
            <line
              x1={points[hoveredPoint].x}
              y1={padding}
              x2={points[hoveredPoint].x}
              y2={padding + plotHeight}
              stroke="rgb(37, 99, 235)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
              className="pointer-events-none"
            />
          )}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              {/* Invisible larger circle for easier hovering */}
              <circle
                cx={point.x}
                cy={point.y}
                r="15"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              
              {/* Visible data point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "8" : "6"}
                fill="rgb(37, 99, 235)"
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-200 pointer-events-none"
                style={{
                  filter: hoveredPoint === index ? 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))' : 'none'
                }}
              />
            </g>
          ))}
          
          {/* Interactive tooltip */}
          {hoveredPoint !== null && (
            <g>
              {/* Tooltip background */}
              <rect
                x={points[hoveredPoint].x - 55}
                y={points[hoveredPoint].y - 55}
                width="110"
                height="40"
                fill="rgb(17, 24, 39)"
                stroke="rgb(37, 99, 235)"
                strokeWidth="1"
                rx="8"
                className="drop-shadow-lg"
              />
              
              {/* Week number */}
              <text
                x={points[hoveredPoint].x}
                y={points[hoveredPoint].y - 38}
                textAnchor="middle"
                className="fill-white font-semibold"
                style={{ fontSize: '13px' }}
              >
                Week {points[hoveredPoint].week.weekNumber}
              </text>
              
              {/* Mileage */}
              <text
                x={points[hoveredPoint].x}
                y={points[hoveredPoint].y - 22}
                textAnchor="middle"
                className="fill-blue-300"
                style={{ fontSize: '14px' }}
              >
                {points[hoveredPoint].week.totalDistance.toFixed(1)} miles
              </text>
              
              {/* Tooltip arrow pointing to data point */}
              <polygon
                points={`${points[hoveredPoint].x-6},${points[hoveredPoint].y-15} ${points[hoveredPoint].x+6},${points[hoveredPoint].y-15} ${points[hoveredPoint].x},${points[hoveredPoint].y-9}`}
                fill="rgb(17, 24, 39)"
              />
            </g>
          )}
        </svg>
      </div>
      
      {/* Summary stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {(weeks.reduce((sum, w) => sum + w.totalDistance, 0) / weeks.length).toFixed(1)} mi
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Weekly</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {maxMileage.toFixed(1)} mi
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Peak Week</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {weeks.reduce((sum, w) => sum + w.totalDistance, 0).toFixed(1)} mi
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Miles</div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { WeeklyMileage } from '@/lib/training/analysis';
import Card from '@/components/ui/Card';

interface ElevationChartProps {
  weeklyMileage: WeeklyMileage[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  selectedIndex: number | null;
  onWeekClick: (index: number | null) => void;
}

export function ElevationChart({ weeklyMileage, hoveredIndex, onHoverChange, selectedIndex, onWeekClick }: ElevationChartProps) {
  const maxElevation = Math.max(...weeklyMileage.map(w => w.elevationGain), 0);
  const totalElevation = weeklyMileage.reduce((sum, w) => sum + w.elevationGain, 0);
  const avgElevation = weeklyMileage.length > 0 ? totalElevation / weeklyMileage.length : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Convert meters to feet
  const metersToFeet = (meters: number) => meters * 3.28084;

  // Sort data from oldest to newest for the line chart
  const sortedData = [...weeklyMileage].sort((a, b) =>
    a.weekStart.getTime() - b.weekStart.getTime()
  );

  // Chart dimensions
  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const yMax = maxElevation * 1.1; // Add 10% padding at top
  const xStep = chartWidth / (sortedData.length - 1 || 1);

  // Generate path for line
  const generatePath = () => {
    if (sortedData.length === 0) return '';

    return sortedData.map((week, index) => {
      const x = padding.left + (index * xStep);
      const y = padding.top + chartHeight - (week.elevationGain / yMax * chartHeight);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate area fill path
  const generateAreaPath = () => {
    if (sortedData.length === 0) return '';

    const linePath = sortedData.map((week, index) => {
      const x = padding.left + (index * xStep);
      const y = padding.top + chartHeight - (week.elevationGain / yMax * chartHeight);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const baselineStart = `L ${padding.left + ((sortedData.length - 1) * xStep)} ${padding.top + chartHeight}`;
    const baselineEnd = `L ${padding.left} ${padding.top + chartHeight}`;

    return `${linePath} ${baselineStart} ${baselineEnd} Z`;
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Elevation Gain</h3>

        {weeklyMileage.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No weekly data available
          </div>
        ) : (
          <>
            {/* Line Chart */}
            <div className="mb-6 overflow-x-auto relative">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                style={{ minHeight: '180px' }}
                onClick={() => onWeekClick(null)}
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                  const y = padding.top + chartHeight - (fraction * chartHeight);
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + chartWidth}
                        y2={y}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-xs fill-gray-500"
                        style={{ fontSize: '12px' }}
                      >
                        {metersToFeet(yMax * fraction).toFixed(0)}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical hover line */}
                {hoveredIndex !== null && (
                  <line
                    x1={padding.left + (hoveredIndex * xStep)}
                    y1={padding.top}
                    x2={padding.left + (hoveredIndex * xStep)}
                    y2={padding.top + chartHeight}
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                )}

                {/* Area fill */}
                <path
                  d={generateAreaPath()}
                  fill="rgb(34, 197, 94)"
                  fillOpacity="0.1"
                />

                {/* Line */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {sortedData.map((week, index) => {
                  const x = padding.left + (index * xStep);
                  const y = padding.top + chartHeight - (week.elevationGain / yMax * chartHeight);
                  const isHovered = hoveredIndex === index;
                  const isSelected = selectedIndex === index;

                  return (
                    <g key={index}>
                      {/* Selected indicator ring */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="2"
                          opacity="0.5"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? "6" : isHovered ? "6" : "4"}
                        fill={isSelected ? "rgb(34, 197, 94)" : "white"}
                        stroke="rgb(34, 197, 94)"
                        strokeWidth={isHovered || isSelected ? "3" : "2"}
                        className="transition-all"
                      />
                      {/* Invisible larger circle for easier hover and click */}
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => onHoverChange(index)}
                        onMouseLeave={() => onHoverChange(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onWeekClick(index);
                        }}
                      />
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {sortedData.map((week, index) => {
                  // Show every other label if there are many weeks
                  const showLabel = sortedData.length <= 8 || index % 2 === 0;
                  if (!showLabel) return null;

                  const x = padding.left + (index * xStep);

                  return (
                    <text
                      key={index}
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                      style={{ fontSize: '11px' }}
                    >
                      {formatDate(week.weekStart)}
                    </text>
                  );
                })}

                {/* Y-axis label */}
                <text
                  x={padding.left - 35}
                  y={padding.top + chartHeight / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 ${padding.left - 35} ${padding.top + chartHeight / 2})`}
                  className="text-xs fill-gray-600 font-medium"
                  style={{ fontSize: '12px' }}
                >
                  Feet
                </text>
              </svg>

              {/* Tooltip */}
              {hoveredIndex !== null && sortedData[hoveredIndex] && (() => {
                const x = padding.left + (hoveredIndex * xStep);
                const y = padding.top + chartHeight - (sortedData[hoveredIndex].elevationGain / yMax * chartHeight);

                // Calculate tooltip position as percentage
                const tooltipX = (x / width) * 100;
                const tooltipY = (y / height) * 100;

                // Smart positioning to avoid cutoff
                let transformX = '-50%'; // Center by default
                let transformY = '-110%'; // Just above by default

                // If too far left, align to left edge
                if (tooltipX < 15) {
                  transformX = '0%';
                }
                // If too far right, align to right edge
                else if (tooltipX > 85) {
                  transformX = '-100%';
                }

                // If too close to top, position just below instead
                if (tooltipY < 40) {
                  transformY = '10%';
                }

                // If too close to bottom, position just above instead
                if (tooltipY > 70) {
                  transformY = '-110%';
                }

                return (
                  <div
                    className="absolute bg-gray-900 dark:bg-gray-700 text-white px-2 py-1.5 rounded shadow-lg text-xs z-10 pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${tooltipX}%`,
                      top: `${tooltipY}%`,
                      transform: `translate(${transformX}, ${transformY})`
                    }}
                  >
                    <div className="font-semibold text-xs">{formatDate(sortedData[hoveredIndex].weekStart)}</div>
                    <div className="text-green-300">{metersToFeet(sortedData[hoveredIndex].elevationGain).toFixed(0)} ft</div>
                    <div className="text-gray-300">{sortedData[hoveredIndex].runs} runs</div>
                  </div>
                );
              })()}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{metersToFeet(avgElevation).toFixed(0)} ft</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg Weekly</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{metersToFeet(maxElevation).toFixed(0)} ft</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Peak Week</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {metersToFeet(totalElevation).toFixed(0)} ft
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Gain</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

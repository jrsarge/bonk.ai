import { TrainingPlan } from '@/types';

export interface ExportOptions {
  format: 'json' | 'csv' | 'ical' | 'text' | 'pdf';
  includeNotes?: boolean;
}

export class PlanExporter {
  /**
   * Export a training plan in the specified format
   */
  static export(plan: TrainingPlan, options: ExportOptions): string {
    switch (options.format) {
      case 'json':
        return this.exportJSON(plan);
      case 'csv':
        return this.exportCSV(plan, options);
      case 'ical':
        return this.exportICal(plan);
      case 'text':
        return this.exportText(plan, options);
      case 'pdf':
        return this.exportHTML(plan, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Download the exported plan as a file
   */
  static download(plan: TrainingPlan, options: ExportOptions): void {
    if (options.format === 'pdf') {
      this.downloadPDF(plan, options);
      return;
    }

    const content = this.export(plan, options);
    const filename = this.generateFilename(plan, options.format);
    const mimeType = this.getMimeType(options.format);

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Download plan as PDF using print functionality
   */
  static downloadPDF(plan: TrainingPlan, options: ExportOptions): void {
    const htmlContent = this.exportHTML(plan, options);
    
    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Could not open print window for PDF export');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    };
  }

  /**
   * Export as HTML (for PDF conversion)
   */
  private static exportHTML(plan: TrainingPlan, options: ExportOptions): string {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'rest': return '#6b7280';
        case 'easy': return '#059669';
        case 'tempo': return '#ea580c';
        case 'interval': return '#dc2626';
        case 'long': return '#7c3aed';
        case 'cross': return '#2563eb';
        case 'race': return '#d97706';
        default: return '#6b7280';
      }
    };

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.formatRaceDistance(plan.raceDistance)} Training Plan</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #374151;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 2.5em;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 1.2em;
            color: #6b7280;
        }
        .summary {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
        }
        .week {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .week-header {
            background: #2563eb;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            font-weight: bold;
            font-size: 1.3em;
        }
        .week-info {
            background: #e5e7eb;
            padding: 10px 15px;
            border-radius: 0 0 8px 8px;
            margin-bottom: 15px;
            font-size: 0.9em;
        }
        .workout {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            margin: 10px 0;
            overflow: hidden;
        }
        .workout-header {
            padding: 12px 15px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f9fafb;
        }
        .workout-type {
            padding: 4px 8px;
            border-radius: 12px;
            color: white;
            font-size: 0.75em;
            font-weight: bold;
        }
        .workout-details {
            padding: 15px;
        }
        .workout-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin: 10px 0;
        }
        .metric {
            text-align: center;
            padding: 8px;
            background: #f3f4f6;
            border-radius: 4px;
        }
        .metric-value {
            font-weight: bold;
            font-size: 1.1em;
            color: #1f2937;
        }
        .metric-label {
            font-size: 0.8em;
            color: #6b7280;
        }
        .notes {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-style: italic;
            font-size: 0.9em;
        }
        .pace-guide {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 20px 0;
        }
        .effort-dots {
            display: inline-flex;
            gap: 2px;
        }
        .effort-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .week { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${this.formatRaceDistance(plan.raceDistance)} Training Plan</div>
        <div class="subtitle">Generated by bonk.ai on ${new Date(plan.generatedAt).toLocaleDateString()}</div>
    </div>

    <div class="summary">
        <h2>Plan Overview</h2>
        ${plan.targetTime ? `<p><strong>Target Time:</strong> ${plan.targetTime}</p>` : ''}
        <p><strong>Duration:</strong> ${plan.summary.totalWeeks} weeks</p>
        <p><strong>Peak Weekly Mileage:</strong> ${plan.summary.peakWeeklyMileage.toFixed(0)} miles</p>
        <p>${plan.summary.description}</p>
        
        ${plan.summary.paceRecommendations ? `
            <h3>Pace Guide</h3>
            <div class="pace-guide">
                ${Object.entries(plan.summary.paceRecommendations).map(([type, pace]) => `
                    <div class="metric">
                        <div class="metric-value">${pace}</div>
                        <div class="metric-label">${type.charAt(0).toUpperCase() + type.slice(1)} Pace</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
`;

    plan.weeks.forEach(week => {
      html += `
    <div class="week">
        <div class="week-header">
            Week ${week.weekNumber}: ${week.theme}
        </div>
        <div class="week-info">
            <strong>Total Distance:</strong> ${week.totalDistance.toFixed(1)} miles
            ${week.keyWorkout ? ` | <strong>Key Workout:</strong> ${week.keyWorkout}` : ''}
        </div>
        ${week.description ? `<p style="margin: 0 0 15px 0; padding: 0 5px;">${week.description}</p>` : ''}
`;

      week.workouts.forEach(workout => {
        const typeColor = getTypeColor(workout.type);
        
        html += `
        <div class="workout">
            <div class="workout-header">
                <span>${this.getDayName(workout.day)}: ${workout.name}</span>
                <span class="workout-type" style="background-color: ${typeColor};">
                    ${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                </span>
            </div>
            <div class="workout-details">
                <p>${workout.description}</p>
`;

        if (workout.type !== 'rest') {
          html += `
                <div class="workout-metrics">
                    ${workout.distance ? `
                        <div class="metric">
                            <div class="metric-value">${workout.distance.toFixed(1)} mi</div>
                            <div class="metric-label">Distance</div>
                        </div>
                    ` : ''}
                    ${workout.duration ? `
                        <div class="metric">
                            <div class="metric-value">${workout.duration} min</div>
                            <div class="metric-label">Duration</div>
                        </div>
                    ` : ''}
                    ${workout.targetPace ? `
                        <div class="metric">
                            <div class="metric-value">${workout.targetPace}</div>
                            <div class="metric-label">Target Pace</div>
                        </div>
                    ` : ''}
                    <div class="metric">
                        <div class="metric-value">
                            <div class="effort-dots">
                                ${[1, 2, 3, 4, 5].map(level => 
                                  `<div class="effort-dot" style="background-color: ${
                                    level <= workout.effortLevel ? '#ef4444' : '#d1d5db'
                                  };"></div>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="metric-label">Effort ${workout.effortLevel}/5</div>
                    </div>
                </div>
`;
        }

        if (options.includeNotes && workout.notes) {
          html += `<div class="notes">💡 ${workout.notes}</div>`;
        }


        html += `
            </div>
        </div>
`;
      });

      html += `</div>`;
    });

    html += `
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 0.9em;">
        Generated by <strong>bonk.ai</strong> - AI-powered training plans
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Export as JSON (full plan data)
   */
  private static exportJSON(plan: TrainingPlan): string {
    return JSON.stringify(plan, null, 2);
  }

  /**
   * Export as CSV (workout data)
   */
  private static exportCSV(plan: TrainingPlan, options: ExportOptions): string {
    const headers = [
      'Week',
      'Day',
      'Date',
      'Workout Type',
      'Name',
      'Description',
      'Distance (mi)',
      'Duration (min)',
      'Target Pace',
      'Effort Level'
    ];

    if (options.includeNotes) {
      headers.push('Notes');
    }


    const rows = [headers.join(',')];

    plan.weeks.forEach(week => {
      week.workouts.forEach(workout => {
        const row = [
          week.weekNumber.toString(),
          workout.day.toString(),
          workout.date || '',
          workout.type,
          `"${workout.name}"`,
          `"${workout.description}"`,
          workout.distance?.toFixed(1) || '',
          workout.duration?.toString() || '',
          workout.targetPace || '',
          workout.effortLevel.toString()
        ];

        if (options.includeNotes) {
          row.push(`"${workout.notes || ''}"`);
        }


        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  /**
   * Export as iCalendar format
   */
  private static exportICal(plan: TrainingPlan): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//bonk.ai//Training Plan//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.formatRaceDistance(plan.raceDistance)} Training Plan`,
      'X-WR-CALDESC:AI-generated training plan from bonk.ai'
    ];

    plan.weeks.forEach(week => {
      week.workouts.forEach(workout => {
        if (workout.type !== 'rest') {
          const startDate = this.formatDateForICal(workout.date);
          const uid = `workout-${plan.id}-${week.weekNumber}-${workout.day}@bonk.ai`;

          lines.push(
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTART:${startDate}`,
            `DTEND:${startDate}`,
            `SUMMARY:${workout.name}`,
            `DESCRIPTION:${workout.description}${workout.targetPace ? ` (Pace: ${workout.targetPace})` : ''}${workout.notes ? `\\n\\nNotes: ${workout.notes}` : ''}`,
            `CATEGORIES:Running,Training`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
          );
        }
      });
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Export as readable text format
   */
  private static exportText(plan: TrainingPlan, options: ExportOptions): string {
    let text = `${this.formatRaceDistance(plan.raceDistance)} TRAINING PLAN\n`;
    text += `Generated by bonk.ai on ${new Date(plan.generatedAt).toLocaleDateString()}\n\n`;

    if (plan.targetTime) {
      text += `Target Time: ${plan.targetTime}\n`;
    }

    text += `Total Weeks: ${plan.summary.totalWeeks}\n`;
    text += `Peak Weekly Mileage: ${plan.summary.peakWeeklyMileage} miles\n\n`;

    if (plan.summary.paceRecommendations) {
      text += 'PACE GUIDE:\n';
      Object.entries(plan.summary.paceRecommendations).forEach(([type, pace]) => {
        text += `${type.charAt(0).toUpperCase() + type.slice(1)}: ${pace}\n`;
      });
      text += '\n';
    }

    text += plan.summary.description + '\n\n';

    text += '='.repeat(50) + '\n\n';

    plan.weeks.forEach(week => {
      text += `WEEK ${week.weekNumber}: ${week.theme.toUpperCase()}\n`;
      text += `Total Distance: ${week.totalDistance.toFixed(1)} miles\n`;
      
      if (week.description) {
        text += `${week.description}\n`;
      }
      
      if (week.keyWorkout) {
        text += `Key Workout: ${week.keyWorkout}\n`;
      }
      
      text += '\n';

      week.workouts.forEach(workout => {
        text += `  Day ${workout.day} (${this.getDayName(workout.day)}): ${workout.name}\n`;
        text += `    Type: ${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}\n`;
        text += `    ${workout.description}\n`;
        
        if (workout.distance) {
          text += `    Distance: ${workout.distance.toFixed(1)} miles\n`;
        }
        
        if (workout.duration) {
          text += `    Duration: ${workout.duration} minutes\n`;
        }
        
        if (workout.targetPace) {
          text += `    Target Pace: ${workout.targetPace}\n`;
        }
        
        text += `    Effort Level: ${workout.effortLevel}/5\n`;
        
        if (options.includeNotes && workout.notes) {
          text += `    Notes: ${workout.notes}\n`;
        }
        
        
        text += '\n';
      });

      text += '-'.repeat(30) + '\n\n';
    });

    return text;
  }

  /**
   * Generate appropriate filename for export
   */
  private static generateFilename(plan: TrainingPlan, format: string): string {
    const distance = this.formatRaceDistance(plan.raceDistance).replace(/\s+/g, '');
    const date = new Date(plan.generatedAt).toISOString().split('T')[0];
    const extension = this.getFileExtension(format);
    
    return `${distance}_TrainingPlan_${date}.${extension}`;
  }

  /**
   * Get file extension for format
   */
  private static getFileExtension(format: string): string {
    switch (format) {
      case 'json': return 'json';
      case 'csv': return 'csv';
      case 'ical': return 'ics';
      case 'text': return 'txt';
      case 'pdf': return 'pdf';
      default: return 'txt';
    }
  }

  /**
   * Get MIME type for format
   */
  private static getMimeType(format: string): string {
    switch (format) {
      case 'json': return 'application/json';
      case 'csv': return 'text/csv';
      case 'ical': return 'text/calendar';
      case 'text': return 'text/plain';
      case 'pdf': return 'text/html';
      default: return 'text/plain';
    }
  }

  /**
   * Format race distance for display
   */
  private static formatRaceDistance(distance: string): string {
    switch (distance) {
      case '5k': return '5K';
      case '10k': return '10K';
      case 'half': return 'Half Marathon';
      case 'marathon': return 'Marathon';
      default: return distance.toUpperCase();
    }
  }

  /**
   * Format date for iCalendar
   */
  private static formatDateForICal(dateString?: string): string {
    if (!dateString) {
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Get day name from day number
   */
  private static getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber - 1] || `Day ${dayNumber}`;
  }

  /**
   * Generate shareable URL for plan
   */
  static generateShareableUrl(planId: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bonk.ai';
    return `${baseUrl}/plans/${planId}`;
  }

  /**
   * Copy plan to clipboard as text
   */
  static async copyToClipboard(plan: TrainingPlan): Promise<void> {
    const text = this.exportText(plan, { 
      format: 'text',
      includeNotes: true
    });

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}
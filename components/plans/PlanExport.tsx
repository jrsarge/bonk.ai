'use client';

import { useState } from 'react';
import { TrainingPlan } from '@/types';
import { PlanExporter, ExportOptions } from '@/lib/export/planExport';

interface PlanExportProps {
  plan: TrainingPlan;
  className?: string;
}

export default function PlanExport({ plan, className = '' }: PlanExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'text',
    includeNotes: true
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setSuccessMessage('');

    try {
      PlanExporter.download(plan, exportOptions);
      setSuccessMessage('Plan exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setSuccessMessage('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    setSuccessMessage('');

    try {
      await PlanExporter.copyToClipboard(plan);
      setSuccessMessage('Plan copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Copy failed:', error);
      setSuccessMessage('Copy failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    const url = PlanExporter.generateShareableUrl(plan.id);
    if (navigator.share) {
      navigator.share({
        title: `My ${plan.raceDistance.toUpperCase()} Training Plan`,
        text: 'Check out my AI-generated training plan from bonk.ai!',
        url: url
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(url).then(() => {
        setSuccessMessage('Share URL copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        Export Plan
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Export Training Plan
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'text', label: 'Text (.txt)', description: 'Readable text format' },
              { value: 'csv', label: 'Spreadsheet (.csv)', description: 'Import into Excel/Sheets' },
              { value: 'ical', label: 'Calendar (.ics)', description: 'Import into calendar apps' }
            ].map((format) => (
              <label key={format.value} className="relative">
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={exportOptions.format === format.value}
                  onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as ExportOptions['format'] })}
                  className="sr-only"
                />
                <div className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  exportOptions.format === format.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {format.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        {(exportOptions.format === 'text' || exportOptions.format === 'csv') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Include Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeNotes}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeNotes: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Include workout notes
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Download File
              </>
            )}
          </button>

          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy to Clipboard
          </button>

          <button
            onClick={handleShare}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Plan
          </button>
        </div>


        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• Text format provides a readable summary of your plan</p>
          <p>• Spreadsheet format can be imported into Excel, Google Sheets, or other spreadsheet applications</p>
          <p>• Calendar format can be imported into most calendar apps like Google Calendar, Outlook, or Apple Calendar</p>
        </div>
      </div>
    </div>
  );
}
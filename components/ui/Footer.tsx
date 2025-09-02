'use client';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Created by: <a 
            href="https://jacobsargent.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            jacobsargent.org
          </a>
        </div>
      </div>
    </footer>
  );
}
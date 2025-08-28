import Link from 'next/link';
import { User } from '@/types';

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">bonk.ai</span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={onLogout}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/connect"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Connect with Strava
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
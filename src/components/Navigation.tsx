'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { APP_NAME, ADD_NEW_PRAYERS_PAGE_NAME, PRAYER_LIST_PAGE_NAME, PRAYER_SESSION_PAGE_NAME } from '@/utils/constants';
import { useRouter, usePathname } from 'next/navigation';

interface NavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}

export function NavItem({ label, isActive, onClick, disabled = false, variant = 'default' }: NavItemProps) {
  const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  
  const variantClasses = {
    default: isActive
      ? 'bg-primary text-white'
      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}

interface NavigationProps {
  newPrayerPointsBeingModified?: boolean;
}

export function Navigation({ newPrayerPointsBeingModified = false }: NavigationProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active view based on current pathname
  const getActiveView = () => {
    if (pathname === '/session') return 'session';
    if (pathname === '/new') return 'input';
    return 'list'; // Default to list view for dashboard
  };

  const currentActiveView = getActiveView();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  const handleNavigation = (view: 'input' | 'list' | 'session') => {
    if (view === 'session') {
      router.push('/session');
    } else if (view === 'input') {
      router.push('/new');
    } else if (view === 'list') {
      router.push('/dashboard');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => handleNavigation('list')}
              >
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {APP_NAME}
                </h1>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NavItem
              label={PRAYER_LIST_PAGE_NAME}
              isActive={currentActiveView === 'list'}
              onClick={() => handleNavigation('list')}
              disabled={newPrayerPointsBeingModified}
            />
            <NavItem
              label={ADD_NEW_PRAYERS_PAGE_NAME}
              isActive={currentActiveView === 'input'}
              onClick={() => handleNavigation('input')}
              disabled={newPrayerPointsBeingModified}
            />
            <NavItem
              label={PRAYER_SESSION_PAGE_NAME}
              isActive={currentActiveView === 'session'}
              onClick={() => handleNavigation('session')}
              disabled={newPrayerPointsBeingModified}
            />
            {newPrayerPointsBeingModified && (
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                Reviewing prayer points...
              </span>
            )}
            <ThemeToggle />
            <div className="ml-4">
              <NavItem
                label="Log Out"
                isActive={false}
                onClick={handleLogout}
                variant="outline"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

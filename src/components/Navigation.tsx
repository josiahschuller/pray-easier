'use client';

import { useState } from 'react';
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
  mobile?: boolean;
}

export function NavItem({ label, isActive, onClick, disabled = false, variant = 'default', mobile = false }: NavItemProps) {
  const baseClasses = mobile 
    ? 'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ease-in-out w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700'
    : 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active view based on current pathname
  const getActiveView = () => {
    if (pathname === '/session') return 'session';
    if (pathname === '/new') return 'input';
    return 'list'; // Default to list view for dashboard
  };

  const currentActiveView = getActiveView();

  const handleNavigation = (view: 'input' | 'list' | 'session') => {
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
    if (view === 'session') {
      router.push('/session');
    } else if (view === 'input') {
      router.push('/new');
    } else if (view === 'list') {
      router.push('/dashboard');
    }
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu
    logout();
    window.location.href = '/auth';
  };

  return (
    <nav className="bg-warm-50 dark:bg-warm-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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
                onClick={handleLogoutClick}
                variant="outline"
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <div className="relative w-6 h-6">
                {/* Hamburger icon */}
                <svg
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0 rotate-45 scale-75' : 'opacity-100 rotate-0 scale-100'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Close icon */}
                <svg
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-45 scale-75'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden overflow-hidden">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isMobileMenuOpen
                ? 'max-h-96 opacity-100 transform translate-y-0'
                : 'max-h-0 opacity-0 transform -translate-y-2'
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-warm-50 dark:bg-warm-100 border-t border-gray-200 dark:border-gray-700">
              <div className={`transition-all duration-300 delay-75 ${isMobileMenuOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}>
                <NavItem
                  label={PRAYER_LIST_PAGE_NAME}
                  isActive={currentActiveView === 'list'}
                  onClick={() => handleNavigation('list')}
                  disabled={newPrayerPointsBeingModified}
                  mobile={true}
                />
              </div>
              <div className={`transition-all duration-300 delay-100 ${isMobileMenuOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}>
                <NavItem
                  label={ADD_NEW_PRAYERS_PAGE_NAME}
                  isActive={currentActiveView === 'input'}
                  onClick={() => handleNavigation('input')}
                  disabled={newPrayerPointsBeingModified}
                  mobile={true}
                />
              </div>
              <div className={`transition-all duration-300 delay-150 ${isMobileMenuOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}>
                <NavItem
                  label={PRAYER_SESSION_PAGE_NAME}
                  isActive={currentActiveView === 'session'}
                  onClick={() => handleNavigation('session')}
                  disabled={newPrayerPointsBeingModified}
                  mobile={true}
                />
              </div>
              {newPrayerPointsBeingModified && (
                <div className={`px-3 py-2 transition-all duration-300 delay-200 ${isMobileMenuOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Reviewing prayer points...
                  </span>
                </div>
              )}
              <div className={`pt-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 delay-200 ${isMobileMenuOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}>
                <NavItem
                  label="Log Out"
                  isActive={false}
                  onClick={handleLogoutClick}
                  variant="outline"
                  mobile={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

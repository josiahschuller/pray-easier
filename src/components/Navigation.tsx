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
    if (pathname === '/prayer-list') return 'list';
    return 'dashboard'; // Default to dashboard view
  };

  const currentActiveView = getActiveView();

  const handleNavigation = (view: 'input' | 'list' | 'session' | 'dashboard') => {
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
    if (view === 'session') {
      router.push('/session');
    } else if (view === 'input') {
      router.push('/new');
    } else if (view === 'list') {
      router.push('/prayer-list');
    } else if (view === 'dashboard') {
      router.push('/dashboard');
    }
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu
    logout();
    window.location.href = '/auth';
  };

  // Navigation items configuration
  const navItems = [
    {
      label: ADD_NEW_PRAYERS_PAGE_NAME,
      view: 'input' as const,
      isActive: currentActiveView === 'input',
    },
    {
      label: PRAYER_SESSION_PAGE_NAME,
      view: 'session' as const,
      isActive: currentActiveView === 'session',
    },
    {
      label: PRAYER_LIST_PAGE_NAME,
      view: 'list' as const,
      isActive: currentActiveView === 'list',
    },
  ];

  return (
    <nav className="bg-warm-50 dark:bg-warm-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-0 sm:mx-auto px-0 sm:px-2 lg:px-8">
        {/* Desktop Navigation */}
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => handleNavigation('dashboard')}
              >
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {APP_NAME}
                </h1>
              </button>
              <button
                onClick={() => handleNavigation('dashboard')}
                className="ml-4 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
                title="Home"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                label={item.label}
                isActive={item.isActive}
                onClick={() => handleNavigation(item.view)}
                disabled={newPrayerPointsBeingModified}
              />
            ))}
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
            <div className="px-0 pt-2 pb-3 space-y-1 bg-warm-50 dark:bg-warm-100 border-t border-gray-200 dark:border-gray-700">
              {navItems.map((item, index) => (
                <div
                  key={item.view}
                  className={`transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}
                  style={{ transitionDelay: `${(index + 1) * 75}ms` }}
                >
                  <NavItem
                    label={item.label}
                    isActive={item.isActive}
                    onClick={() => handleNavigation(item.view)}
                    disabled={newPrayerPointsBeingModified}
                    mobile={true}
                  />
                </div>
              ))}
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

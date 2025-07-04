'use client';

import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}

export function NavItem({ label, isActive, onClick, disabled = false, variant = 'default' }: NavItemProps) {
  const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium';
  
  const variantClasses = {
    default: isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
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
  activeView: 'input' | 'list' | 'session';
  onViewChange: (view: 'input' | 'list' | 'session') => void;
  showConfirmation: boolean;
}

export function Navigation({ activeView, onViewChange, showConfirmation }: NavigationProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Prayer Organizer</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NavItem
              label="New Prayers"
              isActive={activeView === 'input'}
              onClick={() => onViewChange('input')}
              disabled={showConfirmation}
            />
            <NavItem
              label="Prayer List"
              isActive={activeView === 'list'}
              onClick={() => onViewChange('list')}
              disabled={showConfirmation}
            />
            <NavItem
              label="Prayer Session"
              isActive={activeView === 'session'}
              onClick={() => onViewChange('session')}
              disabled={showConfirmation}
            />
            {showConfirmation && (
              <span className="text-sm text-gray-600 ml-4">
                Reviewing prayer points...
              </span>
            )}
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

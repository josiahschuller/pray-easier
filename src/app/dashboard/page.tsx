'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrayerInput } from '@/components/PrayerInput';
import { PrayerList } from '@/components/PrayerList';
import { PrayerSession } from '@/components/PrayerSession';
import { checkAuthTokens } from '@/utils/auth-debug';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'input' | 'list' | 'session'>('list');
  const [isClientSide, setIsClientSide] = useState(false);
  
  // Set isClientSide to true when component mounts
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  // Add a useEffect to check auth tokens when the component mounts
  useEffect(() => {
    if (isClientSide) {
      console.log('DashboardPage mounted');
      console.log('User:', user ? `Logged in as ${user.email}` : 'Not logged in');
      checkAuthTokens();
      
      // Check cookies directly
      const hasCookies = document.cookie.includes('sb-access-token') || 
                       document.cookie.includes('sb-refresh-token');
      console.log('Has auth cookies:', hasCookies);
      
      // Don't reload the page, it causes an infinite loop
    }
  }, [user, loading, isClientSide]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    console.error('⚠️ No user found!');
    
    // Instead of returning null, show a message about the authentication state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Issue</h2>
          <p className="mb-4">
            You appear to have authentication cookies, but the user session couldn't be loaded properly.
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm font-mono overflow-auto">
            <p>Auth Cookies: {document.cookie.includes('sb-access-token') ? 'Present' : 'Missing'}</p>
            <p>User State: Missing</p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Return to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Prayer Organizer</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView('input')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'input'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                New Prayers
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Prayer List
              </button>
              <button
                onClick={() => setActiveView('session')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'session'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Prayer Session
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeView === 'input' && <PrayerInput />}
        {activeView === 'list' && <PrayerList />}
        {activeView === 'session' && <PrayerSession />}
      </main>
    </div>
  );
} 
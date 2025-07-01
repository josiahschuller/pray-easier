'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrayerInput } from '@/components/PrayerInput';
import { PrayerList } from '@/components/PrayerList';
import { PrayerSession } from '@/components/PrayerSession';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'input' | 'list' | 'session'>('list');

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
  } else if (!user) {
    console.error('⚠️ No user found!');
    
    // Redirect to auth page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-700">You must be logged in to access this page.</p>
          <a href="/auth" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  console.log('DashboardPage mounted');
  console.log('User:', user ? `Logged in as ${user.emailAddress}` : 'Not logged in');

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
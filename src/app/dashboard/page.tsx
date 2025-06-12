'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrayerInput } from '@/components/PrayerInput';
import { PrayerList } from '@/components/PrayerList';
import { PrayerSession } from '@/components/PrayerSession';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'input' | 'list' | 'session'>('list');

  if (!user) {
    return null; // This will be handled by our middleware
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
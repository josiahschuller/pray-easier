'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedPrayer } from '@/types/database';
import { PrayerInput } from '@/components/PrayerInput';
import { PrayerInputConfirm } from '@/components/PrayerInputConfirm';
import { PrayerList } from '@/components/PrayerList';
import { PrayerSession } from '@/components/PrayerSession';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'input' | 'list' | 'session'>('list');
  const [pendingPrayers, setPendingPrayers] = useState<ProcessedPrayer[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePrayersProcessed = (prayers: ProcessedPrayer[]) => {
    setPendingPrayers(prayers);
    setShowConfirmation(true);
  };

  const handleConfirmPrayers = () => {
    setShowConfirmation(false);
    setPendingPrayers([]);
    setActiveView('list'); // Switch to prayer list view after confirmation
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingPrayers([]);
  };

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
                disabled={showConfirmation}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'input'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                New Prayers
              </button>
              <button
                onClick={() => setActiveView('list')}
                disabled={showConfirmation}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                Prayer List
              </button>
              <button
                onClick={() => setActiveView('session')}
                disabled={showConfirmation}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === 'session'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                Prayer Session
              </button>
              {showConfirmation && (
                <span className="text-sm text-gray-600 ml-4">
                  Reviewing prayer points...
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showConfirmation ? (
          <PrayerInputConfirm 
            prayers={pendingPrayers}
            onConfirm={handleConfirmPrayers}
            onCancel={handleCancelConfirmation}
          />
        ) : (
          <>
            {activeView === 'input' && (
              <PrayerInput onPrayersProcessed={handlePrayersProcessed} />
            )}
            {activeView === 'list' && <PrayerList />}
            {activeView === 'session' && <PrayerSession />}
          </>
        )}
      </main>
    </div>
  );
} 
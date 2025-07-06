'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedPrayer } from '@/types/database';
import { PrayerInput } from '@/components/PrayerInput';
import { PrayerInputConfirm } from '@/components/PrayerInputConfirm';
import { PrayerList } from '@/components/PrayerList';
import { PrayerSession } from '@/components/PrayerSession';
import { Navigation } from '@/components/Navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'input' | 'list' | 'session'>('list');
  const [pendingPrayers, setPendingPrayers] = useState<ProcessedPrayer[]>([]);
  const [newPrayerPointsBeingModified, setNewPrayerPointsBeingModified] = useState(false);

  const handlePrayersProcessed = (prayers: ProcessedPrayer[]) => {
    setPendingPrayers(prayers);
    setNewPrayerPointsBeingModified(true);
  };

  const handleConfirmPrayers = () => {
    setNewPrayerPointsBeingModified(false);
    setPendingPrayers([]);
    setActiveView('list'); // Switch to prayer list view after confirmation
  };

  const handleCancelConfirmation = () => {
    setNewPrayerPointsBeingModified(false);
    setPendingPrayers([]);
  };

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  } else if (!user) {    
    // Redirect to auth page
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-2">You must be logged in to access this page.</p>
          <a href="/auth" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        activeView={activeView}
        onViewChange={setActiveView}
        newPrayerPointsBeingModified={newPrayerPointsBeingModified}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {newPrayerPointsBeingModified ? (
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
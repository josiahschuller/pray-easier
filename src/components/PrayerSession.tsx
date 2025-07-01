'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import toast from 'react-hot-toast';
import type { PrayerPoint } from '@/types/database';
import { PrayerPointStatus } from '@/types/database';

interface PrayerPointWithCategory extends PrayerPoint {
  categoryName?: string;
}

export function PrayerSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerPointWithCategory | null>(null);
  const [prayedPrayerIds, setPrayedPrayerIds] = useState<number[]>([]);
  const { user } = useAuth();
  const { prayers, loading, updatePrayer } = usePrayerPoints();

  const markAsPrayed = async () => {
    if (!currentPrayer) return;
    
    try {
      await updatePrayer(currentPrayer.id, {
        lastTimePrayed: new Date()
      });
      toast.success('Prayer marked as prayed!');
    } catch (error) {
      toast.error('Failed to update prayer');
    }
  };

  const startSession = async () => {
    try {
      // Check if there are any active prayers available
      const activePrayers = prayers.filter(prayer => prayer.status === PrayerPointStatus.ACTIVE);
      
      if (activePrayers.length === 0) {
        toast.error('No active prayer points available. Please add some prayers first.');
        return;
      }

      // Generate a simple session ID (in production, you might want to use a proper session management)
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      setPrayedPrayerIds([]);
      await getNextPrayer();
      toast.success('Prayer session started!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start session');
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      setSessionId(null);
      setCurrentPrayer(null);
      setPrayedPrayerIds([]);
      toast.success('Prayer session ended');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end session');
    }
  };

  const getNextPrayer = async () => {
    if (!sessionId) return;

    try {
      // Get active prayers that haven't been prayed in this session
      const availablePrayers = prayers.filter(prayer => 
        prayer.status === PrayerPointStatus.ACTIVE && 
        !prayedPrayerIds.includes(prayer.id)
      );

      if (availablePrayers.length > 0) {
        // Get a random prayer from available ones
        const randomIndex = Math.floor(Math.random() * availablePrayers.length);
        const selectedPrayer = availablePrayers[randomIndex];
        
        setCurrentPrayer(selectedPrayer);
        setPrayedPrayerIds(prev => [...prev, selectedPrayer.id]);
      } else {
        toast.success('You have prayed through all your prayer points!');
        await endSession();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get next prayer');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Start a Prayer Session
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
            <p>
              Begin a guided prayer session. You will be shown one prayer point at a time
              from your list.
            </p>
          </div>
          <button
            onClick={startSession}
            className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Current Prayer Point
          </h3>
          
          {/* Progress indicator */}
          <div className="mt-2 text-sm text-gray-500">
            {prayedPrayerIds.length} of {prayers.filter(p => p.status === PrayerPointStatus.ACTIVE).length} prayers completed
          </div>
          
          {currentPrayer && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 capitalize mb-2">
                Category: {currentPrayer.categoryName || 'Uncategorized'}
              </p>
              <p className="text-lg text-gray-900">{currentPrayer.content}</p>
            </div>
          )}
          <div className="mt-6 space-x-4">
            <button
              onClick={markAsPrayed}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mark as Prayed
            </button>
            <button
              onClick={getNextPrayer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next Prayer
            </button>
            <button
              onClick={endSession}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import toast from 'react-hot-toast';
import type { PrayerPoint } from '@/types/database';
import { PrayerPointStatus } from '@/types/database';
import { ARCHIVED_TEXT } from '@/utils/constants';

interface PrayerPointWithCategory extends PrayerPoint {
  categoryName?: string;
}

export function PrayerSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerPointWithCategory | null>(null);
  const [prayedPrayerIds, setPrayedPrayerIds] = useState<number[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<{
    prayerCount: number;
    duration: string;
  } | null>(null);
  const { prayers, loading, updatePrayer } = usePrayerPoints();

  const formatDuration = (startTime: Date, endTime: Date): string => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
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

      // Generate a simple session ID and record start time
      const newSessionId = `session_${Date.now()}`;
      const startTime = new Date();
      setSessionId(newSessionId);
      setSessionStartTime(startTime);
      setPrayedPrayerIds([]);
      setShowSessionSummary(false);
      setSessionSummary(null);
      
      // Select the first prayer directly
      const randomIndex = Math.floor(Math.random() * activePrayers.length);
      const selectedPrayer = activePrayers[randomIndex];
      
      setCurrentPrayer(selectedPrayer);
      setPrayedPrayerIds([selectedPrayer.id]);
      
      toast.success('Prayer session started!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start session');
    }
  };

  const endSession = async () => {
    if (!sessionId || !sessionStartTime) return;

    try {
      // Mark the current prayer as prayed before ending the session
      if (currentPrayer) {
        await updatePrayer(currentPrayer.id, {
          lastTimePrayed: new Date()
        });
      }

      // Calculate session summary
      const endTime = new Date();
      const duration = formatDuration(sessionStartTime, endTime);
      const prayerCount = prayedPrayerIds.length;

      setSessionSummary({
        prayerCount,
        duration
      });
      setShowSessionSummary(true);

      // Clear session state
      setSessionId(null);
      setCurrentPrayer(null);
      setPrayedPrayerIds([]);
      setSessionStartTime(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end session');
    }
  };

  const closeSummary = () => {
    setShowSessionSummary(false);
    setSessionSummary(null);
  };

  const getNextPrayer = async () => {
    if (!sessionId) return;

    try {
      // Mark the current prayer as prayed before moving to the next one
      if (currentPrayer) {
        await updatePrayer(currentPrayer.id, {
          lastTimePrayed: new Date()
        });
      }

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

  const archivePrayer = async () => {
    if (!sessionId || !currentPrayer) return;

    try {
      // Mark the prayer as archived and prayed
      await updatePrayer(currentPrayer.id, {
        status: PrayerPointStatus.ARCHIVED,
        lastTimePrayed: new Date()
      });

      toast.success('Prayer archived');

      // Get active prayers that haven't been prayed in this session (excluding the one we just archived)
      const availablePrayers = prayers.filter(prayer => 
        prayer.status === PrayerPointStatus.ACTIVE && 
        !prayedPrayerIds.includes(prayer.id) &&
        prayer.id !== currentPrayer.id
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
      toast.error(error instanceof Error ? error.message : 'Failed to archive prayer');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (showSessionSummary && sessionSummary) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-2">
            Prayer Session Complete
          </h3>
          <div className="mt-4 space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                You prayed for {sessionSummary.prayerCount} prayer point{sessionSummary.prayerCount !== 1 ? 's' : ''}!
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total session time: {sessionSummary.duration}
              </div>
            </div>
          </div>
          <button
            onClick={closeSummary}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Start a Prayer Session
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400 mx-auto">
            <p>
              Begin a guided prayer session. You will be shown one prayer point at a time
              from your list.
            </p>
          </div>
          <button
            onClick={startSession}
            className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Current Prayer Point
          </h3>
          
          {/* Progress indicator */}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Prayed {prayedPrayerIds.length - 1} prayer point{prayedPrayerIds.length - 1 !== 1 ? 's' : ''}
          </div>
          
          {currentPrayer && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">
                Category: {currentPrayer.categoryName || 'Uncategorized'}
              </p>
              <p className="text-lg text-gray-900 dark:text-gray-100">{currentPrayer.content}</p>
            </div>
          )}
          <div className="mt-6 space-x-4">
            <button
              onClick={getNextPrayer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Next Prayer
            </button>
            <button
              onClick={archivePrayer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              {ARCHIVED_TEXT}
            </button>
            <button
              onClick={endSession}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import toast from 'react-hot-toast';
import type { PrayerPoint } from '@/types/database';
import { PrayerPointStatus } from '@/types/database';
import { ARCHIVE_BUTTON_TEXT } from '@/utils/constants';

interface PrayerPointWithCategory extends PrayerPoint {
  categoryName?: string;
}

interface SessionSummaryCardProps {
  summary: {
    prayerCount: number;
    duration: string;
  };
  onClose: () => void;
}

/**
 * Component to display the session summary after completion
 */
function SessionSummaryCard({ summary, onClose }: SessionSummaryCardProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100 mb-6">
        Prayer Session Complete
      </h3>
      <div className="space-y-3 mb-8">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          You prayed for {summary.prayerCount} prayer point{summary.prayerCount !== 1 ? 's' : ''}!
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total session time: {summary.duration}
        </div>
      </div>
      <button
        onClick={onClose}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Close
      </button>
    </div>
  );
}

interface StartSessionCardProps {
  onStart: () => void;
}

/**
 * Component to display the start session screen
 */
function StartSessionCard({ onStart }: StartSessionCardProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
        Start a Prayer Session
      </h3>
      <div className="max-w-xl text-sm text-gray-500 dark:text-gray-400 mx-auto mb-8">
        <p>
          Begin a guided prayer session. You will be shown one prayer point at a time
          from your list.
        </p>
      </div>
      <button
        onClick={onStart}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Start Session
      </button>
    </div>
  );
}

interface CurrentPrayerDisplayProps {
  prayer: PrayerPointWithCategory;
  prayedCount: number;
  isTransitioning: boolean;
}

/**
 * Component to display the current prayer point information
 */
function CurrentPrayerDisplay({ prayer, prayedCount, isTransitioning }: CurrentPrayerDisplayProps) {
  return (
    <div className={`text-center py-8 transition-opacity duration-300 ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}>
      <h3 className="text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100 mb-6">
        Current Prayer Point
      </h3>
      
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-3">
          Category: {prayer.categoryName || 'Uncategorized'}
        </p>
        <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
          {prayer.content}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Prayed {prayedCount} prayer point{prayedCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

interface SessionControlsProps {
  onNext: () => void;
  onArchive: () => void;
  onEnd: () => void;
  isTransitioning: boolean;
}

/**
 * Component for session control buttons
 */
function SessionControls({ onNext, onArchive, onEnd, isTransitioning }: SessionControlsProps) {
  return (
    <div className="flex justify-center space-x-4">
      <button
        onClick={onNext}
        disabled={isTransitioning}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTransitioning ? 'Loading...' : 'Next Prayer'}
      </button>
      <button
        onClick={onArchive}
        disabled={isTransitioning}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {ARCHIVE_BUTTON_TEXT}
      </button>
      <button
        onClick={onEnd}
        disabled={isTransitioning}
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        End Session
      </button>
    </div>
  );
}

/**
 * Helper function to format session duration
 * @param startTime - Session start time
 * @param endTime - Session end time
 * @returns Formatted duration string
 */
function formatDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

/**
 * Helper function to get a random prayer from available prayers
 * @param prayers - All prayers to choose from
 * @param excludeIds - Prayer IDs to exclude from selection
 * @returns Random prayer or null if none available
 */
function getRandomPrayer(prayers: PrayerPointWithCategory[], excludeIds: number[]): PrayerPointWithCategory | null {
  const availablePrayers = prayers.filter(prayer => 
    prayer.status === PrayerPointStatus.ACTIVE && 
    !excludeIds.includes(prayer.id)
  );

  if (availablePrayers.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availablePrayers.length);
  return availablePrayers[randomIndex];
}

/**
 * Main prayer session component with simplified state management
 */
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { prayers, loading, updatePrayer } = usePrayerPoints();

  const startSession = async () => {
    try {
      // Check if there are any active prayers available
      const activePrayers = prayers.filter(prayer => prayer.status === PrayerPointStatus.ACTIVE);
      
      if (activePrayers.length === 0) {
        toast.error('No active prayer points available. Please add some prayers first.');
        return;
      }

      // Initialize session
      const newSessionId = `session_${Date.now()}`;
      const startTime = new Date();
      setSessionId(newSessionId);
      setSessionStartTime(startTime);
      setPrayedPrayerIds([]);
      setShowSessionSummary(false);
      setSessionSummary(null);
      
      // Select the first prayer
      const selectedPrayer = getRandomPrayer(activePrayers, []);
      if (selectedPrayer) {
        setCurrentPrayer(selectedPrayer);
        setPrayedPrayerIds([selectedPrayer.id]);
        toast.success('Prayer session started!');
      }
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

      setSessionSummary({ prayerCount, duration });
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

    setIsTransitioning(true);
    
    try {
      // Mark the current prayer as prayed
      if (currentPrayer) {
        await updatePrayer(currentPrayer.id, {
          lastTimePrayed: new Date()
        });
      }

      // Get next available prayer
      const selectedPrayer = getRandomPrayer(prayers, prayedPrayerIds);

      if (selectedPrayer) {
        // Update prayer content and state together
        setCurrentPrayer(selectedPrayer);
        setPrayedPrayerIds(prev => [...prev, selectedPrayer.id]);
      } else {
        toast.success('You have prayed through all your prayer points!');
        await endSession();
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get next prayer');
    } finally {
      setIsTransitioning(false);
    }
  };

  const archivePrayer = async () => {
    if (!sessionId || !currentPrayer) return;

    setIsTransitioning(true);

    try {
      // Mark the prayer as archived and prayed
      await updatePrayer(currentPrayer.id, {
        status: PrayerPointStatus.ARCHIVED,
        lastTimePrayed: new Date()
      });

      toast.success('Prayer archived');

      // Get next available prayer (excluding the one we just archived)
      const selectedPrayer = getRandomPrayer(
        prayers.filter(p => p.id !== currentPrayer.id), 
        prayedPrayerIds
      );

      if (selectedPrayer) {
        // Update prayer content and state together
        setCurrentPrayer(selectedPrayer);
        setPrayedPrayerIds(prev => [...prev, selectedPrayer.id]);
      } else {
        toast.success('You have prayed through all your prayer points!');
        await endSession();
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive prayer');
    } finally {
      setIsTransitioning(false);
    }
  };

  if (loading && !isTransitioning) {
    return (
      <div className="text-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (showSessionSummary && sessionSummary) {
    return <SessionSummaryCard summary={sessionSummary} onClose={closeSummary} />;
  }

  if (!sessionId) {
    return <StartSessionCard onStart={startSession} />;
  }

  return (
    <div>
      {currentPrayer && (
        <>
          <CurrentPrayerDisplay 
            prayer={currentPrayer} 
            prayedCount={prayedPrayerIds.length - 1} 
            isTransitioning={isTransitioning}
          />
          <SessionControls
            onNext={getNextPrayer}
            onArchive={archivePrayer}
            onEnd={endSession}
            isTransitioning={isTransitioning}
          />
        </>
      )}
    </div>
  );
}
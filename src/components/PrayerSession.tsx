'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import toast from 'react-hot-toast';
import type { PrayerPoint } from '@/types/database';

export function PrayerSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const startSession = async () => {
    setLoading(true);
    try {
      // Create a new session
      const { data: session, error: sessionError } = await supabase
        .from('prayer_sessions')
        .insert({
          user_id: user?.id,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(session.id);
      await getNextPrayer();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('prayer_sessions')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      setSessionId(null);
      setCurrentPrayer(null);
      toast.success('Prayer session ended');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end session');
    }
  };

  const getNextPrayer = async () => {
    if (!sessionId) return;

    try {
      // Get a random unprayed prayer point
      const { data: prayedIds } = await supabase
        .from('prayer_session_points')
        .select('prayer_point_id')
        .eq('session_id', sessionId);

      const { data: prayers, error } = await supabase
        .from('prayer_points')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_resolved', false)
        .not('id', 'in', (prayedIds || []).map((p) => p.prayer_point_id))
        .limit(1);

      if (error) throw error;

      if (prayers && prayers.length > 0) {
        setCurrentPrayer(prayers[0]);
        // Record this prayer point in the session
        await supabase.from('prayer_session_points').insert({
          session_id: sessionId,
          prayer_point_id: prayers[0].id,
          prayed_at: new Date().toISOString(),
        });
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
          {currentPrayer && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 capitalize mb-2">
                Category: {currentPrayer.category_id}
              </p>
              <p className="text-lg text-gray-900">{currentPrayer.content}</p>
            </div>
          )}
          <div className="mt-6 space-x-4">
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
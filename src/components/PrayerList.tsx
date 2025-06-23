'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import toast from 'react-hot-toast';
import type { PrayerPoint } from '@/types/database';

export function PrayerList() {
  const [prayers, setPrayers] = useState<PrayerPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPrayers();
    }
  }, [user]);

  const loadPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_points')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error('Error loading prayers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load prayers');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (prayerId: string) => {
    try {
      const { error } = await supabase
        .from('prayer_points')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', prayerId);

      if (error) throw error;
      setPrayers((prev) =>
        prev.map((prayer) =>
          prayer.id === prayerId
            ? { ...prayer, is_resolved: true, resolved_at: new Date().toISOString() }
            : prayer
        )
      );
      toast.success('Prayer marked as resolved!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update prayer');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading prayers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(
        prayers.reduce((acc, prayer) => {
          const category = prayer.category_id;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(prayer);
          return acc;
        }, {} as Record<string, PrayerPoint[]>)
      ).map(([category, categoryPrayers]) => (
        <div key={category} className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 capitalize">
              {category}
            </h3>
            <div className="mt-4 space-y-4">
              {categoryPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`flex items-start justify-between ${
                    prayer.is_resolved ? 'opacity-50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-500">{prayer.content}</p>
                  {!prayer.is_resolved && (
                    <button
                      onClick={() => handleResolve(prayer.id)}
                      className="ml-4 text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {prayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prayers added yet.</p>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { useAuth } from '@/contexts/AuthContext';
import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';

export function PrayerInput() {
  const [text, setText] = useState('');
  const { addPrayer, loading } = usePrayerPoints();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    try {
      // Process the prayer text using the API
      const response = await fetch(`/api/processPrayer?userId=${user?.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process prayer text');
      }

      const data = await response.json();
      const processedPrayers = data.prayers;
      
      // Add each prayer using the hook
      for (const prayer of processedPrayers) {
        await addPrayer(prayer.content, prayer.category);
      }

      toast.success('Prayer points added successfully!');
      setText('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Add New Prayer Points
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Enter your prayer points below. You can paste text from emails, news articles,
            or write your own prayers. The system will organize them into categories for you.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5">
          <TextareaAutosize
            minRows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder="Enter your prayer points here..."
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Prayer Points'}
          </button>
        </form>
      </div>
    </div>
  );
} 
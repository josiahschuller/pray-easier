'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedPrayer } from '@/types/database';
import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';

interface PrayerInputProps {
  onPrayersProcessed: (prayers: ProcessedPrayer[]) => void;
}

export function PrayerInput({ onPrayersProcessed }: PrayerInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    try {
      setLoading(true);
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
      
      // Pass the processed prayers to the confirmation component
      onPrayersProcessed(processedPrayers);
      setText('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
        Add New Prayer Points
      </h3>
      <div className="mb-6 max-w-xl text-sm text-gray-500 dark:text-gray-400">
        <p>
          Enter your prayer points below. You can paste text from emails, news articles,
          or write your own prayers. The system will organise them into categories for you.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextareaAutosize
          minRows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter your prayer points here..."
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Submit Prayer Points'}
        </button>
      </form>
    </div>
  );
} 
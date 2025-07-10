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
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-2xl leading-6 font-medium text-gray-900">
          Add New Prayer Points
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Enter your prayer points below. You can paste text from emails, news articles,
            or write your own prayers. The system will organise them into categories for you.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5">
          <TextareaAutosize
            minRows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder="Enter your prayer points here..."
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Prayer Points'}
          </button>
        </form>
      </div>
    </div>
  );
} 
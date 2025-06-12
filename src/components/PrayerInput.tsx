'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import { supabase } from '@/services/supabase';

export function PrayerInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // First, send the text to our API for processing
      const response = await fetch('/api/process-prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to process prayers');
      }

      const prayers = await response.json();

      // Then, save the processed prayers to Supabase
      const { error } = await supabase.from('prayer_points').insert(
        prayers.map((prayer: { category: string; content: string }) => ({
          user_id: user?.id,
          category_id: prayer.category.toLowerCase(),
          content: prayer.content,
          is_resolved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

      if (error) throw error;

      toast.success('Prayer points added successfully!');
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
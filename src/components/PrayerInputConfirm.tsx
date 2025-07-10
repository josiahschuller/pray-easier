'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { ProcessedPrayer } from '@/types/database';
import toast from 'react-hot-toast';

interface PrayerInputConfirmProps {
  prayers: ProcessedPrayer[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function PrayerInputConfirm({ prayers, onConfirm, onCancel }: PrayerInputConfirmProps) {
  const [editablePrayers, setEditablePrayers] = useState<ProcessedPrayer[]>(prayers);
  const { addPrayer, loading } = usePrayerPoints();

  const handlePrayerChange = (index: number, field: 'content' | 'category', value: string) => {
    setEditablePrayers(prev => 
      prev.map((prayer, i) => 
        i === index ? { ...prayer, [field]: value } : prayer
      )
    );
  };

  const handleDeletePrayer = (index: number) => {
    setEditablePrayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (editablePrayers.length === 0) {
      toast.error('No prayer points to submit');
      return;
    }

    try {
      // Add each prayer using the hook
      for (const prayer of editablePrayers) {
        await addPrayer(prayer.content, prayer.category);
      }

      toast.success('Prayer points added successfully!');
      onConfirm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add prayer points');
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-2xl leading-6 font-medium text-gray-900">
          Review and Edit Prayer Points
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Review the prayer points below. You can edit the content or category, or delete 
            prayer points before submitting them to your prayer list.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {editablePrayers.map((prayer, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-medium text-gray-900">Prayer Point {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleDeletePrayer(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete prayer point"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prayer Content
                  </label>
                  <textarea
                    value={prayer.content}
                    onChange={(e) => handlePrayerChange(index, 'content', e.target.value)}
                    rows={3}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Enter prayer content..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={prayer.category}
                    onChange={(e) => handlePrayerChange(index, 'category', e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Enter category..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {editablePrayers.length === 0 && (
          <div className="mt-6 text-center py-8 text-gray-500">
            <p>No prayer points to review. All prayer points have been deleted.</p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || editablePrayers.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Submitting...' : `Add ${editablePrayers.length} Prayer Point${editablePrayers.length !== 1 ? 's' : ''} to List`}
          </button>
        </div>
      </div>
    </div>
  );
}

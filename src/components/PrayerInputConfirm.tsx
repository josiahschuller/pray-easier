'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { ProcessedPrayer, PRAYER_THEMES, PRAYER_TYPES } from '@/types/database';
import toast from 'react-hot-toast';

interface PrayerInputConfirmProps {
  prayers: ProcessedPrayer[];
  onConfirm: () => void;
  onCancel: () => void;
}

interface EditablePrayerCardProps {
  prayer: ProcessedPrayer;
  index: number;
  onEdit: (index: number, field: 'content' | 'prayerType' | 'prayerTheme', value: string) => void;
  onDelete: (index: number) => void;
}

/**
 * Individual editable prayer card component
 */
function EditablePrayerCard({ prayer, index, onEdit, onDelete }: EditablePrayerCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-warm-50 dark:bg-gray-800">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Prayer Point {index + 1}</h4>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          title="Delete prayer point"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prayer Content
          </label>
          <textarea
            value={prayer.content}
            onChange={(e) => onEdit(index, 'content', e.target.value)}
            rows={3}
            className="focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-warm-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter prayer content..."
          />
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <select aria-label={`Prayer ${index + 1} type`} value={prayer.prayerType} onChange={(e) => onEdit(index, 'prayerType', e.target.value)} className="rounded-full border border-gray-200 dark:border-gray-600 bg-transparent px-2 py-1 capitalize">
            {PRAYER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select aria-label={`Prayer ${index + 1} theme`} value={prayer.prayerTheme} onChange={(e) => onEdit(index, 'prayerTheme', e.target.value)} className="rounded-full border border-gray-200 dark:border-gray-600 bg-transparent px-2 py-1 capitalize">
            {PRAYER_THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

/**
 * Empty state component for when no prayers exist
 */
function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="mt-6 text-center py-8 text-gray-500 dark:text-gray-400">
      <p>{message}</p>
    </div>
  );
}

interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitDisabled: boolean;
  submitText: string;
}

/**
 * Action buttons component for cancel and submit actions
 */
function ActionButtons({ onCancel, onSubmit, loading, submitDisabled, submitText }: ActionButtonsProps) {
  return (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-warm-50 dark:bg-gray-700 hover:bg-warm-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      >
        Cancel
      </button>
      
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitDisabled}
        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : submitText}
      </button>
    </div>
  );
}

/**
 * Helper function to validate if a category name is reserved
 */

/**
 * Helper function to generate submit button text
 */
function getSubmitButtonText(count: number): string {
  return `Add ${count} Prayer Point${count !== 1 ? 's' : ''} to List`;
}

/**
 * Main component for reviewing and editing prayer points before submission
 */
export function PrayerInputConfirm({ prayers, onConfirm, onCancel }: PrayerInputConfirmProps) {
  const [editablePrayers, setEditablePrayers] = useState<ProcessedPrayer[]>(prayers);
  const { addPrayer, loading } = usePrayerPoints();

  const handlePrayerChange = (index: number, field: 'content' | 'prayerType' | 'prayerTheme', value: string) => {
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
        await addPrayer(prayer.content, prayer.prayerType, prayer.prayerTheme);
      }

      toast.success('Prayer points added successfully!');
      onConfirm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add prayer points');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <h3 className="text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
        Review and Edit Prayer Points
      </h3>
      <div className="mb-6 max-w-xl text-sm text-gray-500 dark:text-gray-400">
        <p>
          Review the prayer points below. You can edit the content or delete
          prayer points before submitting them to your prayer list.
        </p>
      </div>

      {/* Prayer Cards Section */}
      <div className="space-y-4 mb-6">
        {editablePrayers.map((prayer, index) => (
          <EditablePrayerCard
            key={index}
            prayer={prayer}
            index={index}
            onEdit={handlePrayerChange}
            onDelete={handleDeletePrayer}
          />
        ))}
      </div>

      {/* Empty State */}
      {editablePrayers.length === 0 && (
        <EmptyState message="No prayer points to review. All prayer points have been deleted." />
      )}

      {/* Action Buttons */}
      <ActionButtons
        onCancel={onCancel}
        onSubmit={handleSubmit}
        loading={loading}
        submitDisabled={loading || editablePrayers.length === 0}
        submitText={getSubmitButtonText(editablePrayers.length)}
      />
    </div>
  );
}

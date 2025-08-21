'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { PrayerPointStatus, PrayerPoint } from '@/types/database';
import { ARCHIVE_BUTTON_TEXT, ARCHIVED_SECTION_TEXT, UNARCHIVE_BUTTON_TEXT } from '@/utils/constants';
import toast from 'react-hot-toast';

// Local interface for prayers with category name
interface PrayerPointWithCategory extends PrayerPoint {
  categoryName?: string;
}

interface PrayerItemProps {
  prayer: PrayerPointWithCategory;
  onResolve: (prayerId: number) => void;
  onUnarchive?: (prayerId: number) => void;
  isUpdating?: boolean;
}

/**
 * Individual prayer item component with archive/unarchive functionality
 */
function PrayerItem({ prayer, onResolve, onUnarchive, isUpdating = false }: PrayerItemProps) {
  const isArchived = prayer.status === PrayerPointStatus.ARCHIVED;
  
  const onClick = isArchived ? onUnarchive : onResolve;

  return (
    <div className="flex items-start justify-between">
      <p className={`text-sm text-gray-500 ${isArchived ? 'opacity-50' : ''}`}>{prayer.content}</p>
      
      <button
        onClick={() => onClick?.(prayer.id)}
        disabled={isUpdating}
        className={`ml-4 w-25 flex-shrink-0 px-3 py-1 text-sm font-medium text-white rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
          isUpdating 
            ? 'bg-gray-400 cursor-not-allowed opacity-75' 
            : isArchived 
              ? 'bg-secondary hover:bg-secondary-hover' 
              : 'bg-primary hover:bg-primary-hover'
        }`}
      >
        {isUpdating ? 'Updating...' : isArchived ? UNARCHIVE_BUTTON_TEXT : ARCHIVE_BUTTON_TEXT}
      </button>
    </div>
  );
}

interface AccordionHeaderProps {
  categoryName: string;
  prayerCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Reusable accordion header with expand/collapse functionality
 */
function AccordionHeader({ categoryName, prayerCount, isExpanded, onToggle }: AccordionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left group"
    >
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2 flex-1">
        {categoryName} ({prayerCount})
      </h3>
      
      {/* Chevron icon that rotates when expanded */}
      <div className="ml-2 pb-2">
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}

interface AccordionContentProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

/**
 * Animated accordion content wrapper with smooth slide transitions
 */
function AccordionContent({ isExpanded, children }: AccordionContentProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface PrayerCategorySectionProps {
  categoryName: string;
  prayers: PrayerPointWithCategory[];
  onResolve: (prayerId: number) => void;
  onUnarchive?: (prayerId: number) => void;
  optimisticUpdates?: Set<number>;
}

/**
 * Collapsible section for a category of prayers
 */
function PrayerCategorySection({ categoryName, prayers, onResolve, onUnarchive, optimisticUpdates = new Set() }: PrayerCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <AccordionHeader
        categoryName={categoryName}
        prayerCount={prayers.length}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      
      <AccordionContent isExpanded={isExpanded}>
        {prayers.map((prayer) => (
          <PrayerItem
            key={prayer.id}
            prayer={prayer}
            onResolve={onResolve}
            onUnarchive={onUnarchive}
            isUpdating={optimisticUpdates.has(prayer.id)}
          />
        ))}
      </AccordionContent>
    </div>
  );
}

/**
 * Helper function to group prayers by category name
 * @param prayers Array of prayers to group
 * @returns Object with category names as keys and prayer arrays as values
 */
function groupPrayersByCategory(prayers: PrayerPointWithCategory[]) {
  return prayers.reduce((acc, prayer) => {
    const categoryName = prayer.categoryName || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(prayer);
    return acc;
  }, {} as Record<string, PrayerPointWithCategory[]>);
}

/**
 * Helper function to sort prayers alphabetically by content
 * @param prayers Array of prayers to sort
 * @returns Sorted array of prayers
 */
function sortPrayersAlphabetically(prayers: PrayerPointWithCategory[]) {
  return prayers.sort((a, b) => a.content.localeCompare(b.content));
}

/**
 * Main prayer list component with categorized, collapsible sections
 */
export function PrayerList() {
  const { prayers, updatePrayer, loading } = usePrayerPoints();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<number>>(new Set());

  // Handler for archiving prayers with optimistic updates
  const handleResolve = async (prayerId: number) => {
    // Add to optimistic updates set to prevent duplicate clicks
    setOptimisticUpdates(prev => new Set([...prev, prayerId]));
    
    try {
      await updatePrayer(prayerId, { status: PrayerPointStatus.ARCHIVED });
      toast.success('Prayer archived successfully');
    } catch {
      toast.error('Failed to archive prayer');
    } finally {
      // Remove from optimistic updates
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(prayerId);
        return newSet;
      });
    }
  };

  // Handler for unarchiving prayers with optimistic updates
  const handleUnarchive = async (prayerId: number) => {
    // Add to optimistic updates set to prevent duplicate clicks
    setOptimisticUpdates(prev => new Set([...prev, prayerId]));
    
    try {
      await updatePrayer(prayerId, { status: PrayerPointStatus.ACTIVE });
      toast.success('Prayer unarchived successfully');
    } catch {
      toast.error('Failed to unarchive prayer');
    } finally {
      // Remove from optimistic updates
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(prayerId);
        return newSet;
      });
    }
  };

  if (loading && prayers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading prayers...</p>
      </div>
    );
  }

  // Filter and group active prayers by category
  const activePrayers = prayers.filter(prayer => prayer.status !== PrayerPointStatus.ARCHIVED);
  const groupedActivePrayers = groupPrayersByCategory(activePrayers);
  
  // Get archived prayers separately
  const archivedPrayers = prayers.filter(prayer => prayer.status === PrayerPointStatus.ARCHIVED);

  return (
    <div className="space-y-8">
      {/* Active prayers grouped by category */}
      {Object.entries(groupedActivePrayers)
        .sort(([a], [b]) => a.localeCompare(b)) // Sort categories alphabetically
        .map(([categoryName, categoryPrayers]) => (
          <PrayerCategorySection
            key={categoryName}
            categoryName={categoryName}
            prayers={sortPrayersAlphabetically(categoryPrayers)}
            onResolve={handleResolve}
            onUnarchive={handleUnarchive}
            optimisticUpdates={optimisticUpdates}
          />
        ))}

      {/* Archived prayers section - only show if there are archived prayers */}
      {archivedPrayers.length > 0 && (
        <PrayerCategorySection
          key="archived"
          categoryName={ARCHIVED_SECTION_TEXT}
          prayers={sortPrayersAlphabetically(archivedPrayers)}
          onResolve={handleResolve}
          onUnarchive={handleUnarchive}
          optimisticUpdates={optimisticUpdates}
        />
      )}

      {/* Empty state when no prayers exist */}
      {prayers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prayers added yet.</p>
        </div>
      )}
    </div>
  );
}
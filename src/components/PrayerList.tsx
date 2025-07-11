'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { PrayerPointStatus, PrayerPoint } from '@/types/database';
import { ARCHIVE_BUTTON_TEXT, ARCHIVED_SECTION_TEXT } from '@/utils/constants';
import toast from 'react-hot-toast';

// Local interface for prayers with category name
interface PrayerPointWithCategory extends PrayerPoint {
  categoryName?: string;
}

interface PrayerItemProps {
  prayer: PrayerPointWithCategory;
  onResolve: (prayerId: number) => void;
  onUnarchive?: (prayerId: number) => void;
}

/**
 * Individual prayer item component with archive/unarchive functionality
 */
function PrayerItem({ prayer, onResolve, onUnarchive }: PrayerItemProps) {
  const isArchived = prayer.status === PrayerPointStatus.ARCHIVED;
  
  return (
    <div className={`flex items-start justify-between ${isArchived ? 'opacity-50' : ''}`}>
      <p className="text-sm text-gray-500">{prayer.content}</p>
      
      {/* Show unarchive button for archived prayers, archive button for active prayers */}
      {isArchived ? (
        <button
          onClick={() => onUnarchive?.(prayer.id)}
          className="ml-4 w-35 flex-shrink-0 px-3 py-1 text-sm font-medium text-secondary rounded-md border border-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-200 hover:bg-secondary-light hover:text-secondary-hover"
        >
          Unarchive
        </button>
      ) : (
        <button
          onClick={() => onResolve(prayer.id)}
          className="ml-4 w-35 flex-shrink-0 px-3 py-1 text-sm font-medium text-white rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 bg-primary hover:bg-primary-hover"
        >
          {ARCHIVE_BUTTON_TEXT}
        </button>
      )}
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
}

/**
 * Collapsible section for a category of prayers
 */
function PrayerCategorySection({ categoryName, prayers, onResolve, onUnarchive }: PrayerCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Handler for archiving prayers with toast notification
  const handleResolve = (prayerId: number) => {
    updatePrayer(prayerId, { status: PrayerPointStatus.ARCHIVED });
    toast.success('Prayer archived successfully');
  };

  // Handler for unarchiving prayers with toast notification
  const handleUnarchive = (prayerId: number) => {
    updatePrayer(prayerId, { status: PrayerPointStatus.ACTIVE });
    toast.success('Prayer unarchived successfully');
  };

  if (loading) {
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
        />
      )}

      {/* Empty state when no prayers exist */}
      {prayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prayers added yet.</p>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { PrayerPointStatus, PrayerPoint } from '@/types/database';
import { ARCHIVE_BUTTON_TEXT, ARCHIVED_SECTION_TEXT, UNARCHIVE_BUTTON_TEXT } from '@/utils/constants';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
 * Individual prayer item — subtle icon-only actions to keep focus on the prayer.
 */
function PrayerItem({ prayer, onResolve, onUnarchive, isUpdating = false }: PrayerItemProps) {
  const isArchived = prayer.status === PrayerPointStatus.ARCHIVED;
  const onClick = isArchived ? onUnarchive : onResolve;

  return (
    <div className="group flex items-start justify-between gap-4 py-2">
      <p className={`text-base text-gray-700 dark:text-gray-300 leading-relaxed ${isArchived ? 'line-through opacity-50' : ''}`}>
        {prayer.content}
      </p>

      <button
        onClick={() => onClick?.(prayer.id)}
        disabled={isUpdating}
        title={isArchived ? UNARCHIVE_BUTTON_TEXT : ARCHIVE_BUTTON_TEXT}
        className="flex-shrink-0 mt-0.5 p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        {isUpdating ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isArchived ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
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

function AccordionHeader({ categoryName, prayerCount, isExpanded, onToggle }: AccordionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left group"
    >
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-1">
        {categoryName}
        <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">({prayerCount})</span>
      </h3>

      <svg
        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface AccordionContentProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

function AccordionContent({ isExpanded, children }: AccordionContentProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="space-y-1 border-t border-gray-100 dark:border-gray-700 pt-3">
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

function PrayerCategorySection({ categoryName, prayers, onResolve, onUnarchive, optimisticUpdates = new Set() }: PrayerCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
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

function sortPrayersAlphabetically(prayers: PrayerPointWithCategory[]) {
  return prayers.sort((a, b) => a.content.localeCompare(b.content));
}

export function PrayerList() {
  const { prayers, updatePrayer, loading } = usePrayerPoints();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<number>>(new Set());

  const handleResolve = async (prayerId: number) => {
    setOptimisticUpdates(prev => new Set([...prev, prayerId]));
    try {
      await updatePrayer(prayerId, { status: PrayerPointStatus.ARCHIVED });
    } catch {
      toast.error('Failed to archive prayer');
    } finally {
      setOptimisticUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(prayerId);
        return newSet;
      });
    }
  };

  const handleUnarchive = async (prayerId: number) => {
    setOptimisticUpdates(prev => new Set([...prev, prayerId]));
    try {
      await updatePrayer(prayerId, { status: PrayerPointStatus.ACTIVE });
    } catch {
      toast.error('Failed to unarchive prayer');
    } finally {
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

  const activePrayers = prayers.filter(prayer => prayer.status !== PrayerPointStatus.ARCHIVED);
  const groupedActivePrayers = groupPrayersByCategory(activePrayers);
  const archivedPrayers = prayers.filter(prayer => prayer.status === PrayerPointStatus.ARCHIVED);
  const categoryCount = Object.keys(groupedActivePrayers).length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      {prayers.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{activePrayers.length} active prayer{activePrayers.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{categoryCount} categor{categoryCount !== 1 ? 'ies' : 'y'}</span>
          {archivedPrayers.length > 0 && (
            <>
              <span>·</span>
              <span>{archivedPrayers.length} archived</span>
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {prayers.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-lg mb-3">Your prayer list is empty</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start by adding the people and things you want to pray for.
          </p>
          <Link
            href="/new"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Add your first prayers →
          </Link>
        </div>
      )}

      {/* Active prayers */}
      {Object.entries(groupedActivePrayers)
        .sort(([a], [b]) => a.localeCompare(b))
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

      {/* Archived */}
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
    </div>
  );
}
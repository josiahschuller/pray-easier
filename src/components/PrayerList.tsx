'use client';

import { useState } from 'react';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { PrayerPointStatus, PrayerPoint, PRAYER_THEMES, PRAYER_TYPES } from '@/types/database';
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
 * Individual prayer item — compact layout with always-visible action button.
 */
function PrayerItem({ prayer, onResolve, onUnarchive, isUpdating = false }: PrayerItemProps) {
  const isArchived = prayer.status === PrayerPointStatus.ARCHIVED;
  const onClick = isArchived ? onUnarchive : onResolve;

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className={`text-base text-gray-700 dark:text-gray-300 leading-relaxed ${isArchived ? 'line-through opacity-50' : ''}`}>
          {prayer.content}
        </p>
        {(prayer.prayerType || prayer.prayerTheme) && (
          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-1">
            {[prayer.prayerType, prayer.prayerTheme].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <button
        onClick={() => onClick?.(prayer.id)}
        disabled={isUpdating}
        className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
          isUpdating
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isArchived
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800 dark:hover:bg-emerald-900/40'
              : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
        }`}
      >
        {isUpdating ? '...' : isArchived ? UNARCHIVE_BUTTON_TEXT : ARCHIVE_BUTTON_TEXT}
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [themeFilter, setThemeFilter] = useState('all');

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
  const filteredActivePrayers = activePrayers.filter(prayer =>
    (typeFilter === 'all' || prayer.prayerType === typeFilter) &&
    (themeFilter === 'all' || prayer.prayerTheme === themeFilter)
  );
  const groupedActivePrayers = groupPrayersByCategory(filteredActivePrayers);
  const archivedPrayers = prayers.filter(prayer => prayer.status === PrayerPointStatus.ARCHIVED);
  const categoryCount = Object.keys(groupedActivePrayers).length;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      {prayers.length > 0 && (
        <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="dashboard-stat dashboard-stat-active inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium">
            {activePrayers.length} active
          </span>
          <span className="dashboard-stat dashboard-stat-categories inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium">
            {categoryCount} categories
          </span>
          {archivedPrayers.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
              {archivedPrayers.length} archived
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by prayer type" className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 capitalize">
            <option value="all">All types</option>
            {PRAYER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={themeFilter} onChange={(event) => setThemeFilter(event.target.value)} aria-label="Filter by prayer theme" className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 capitalize">
            <option value="all">All themes</option>
            {PRAYER_THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
          </select>
        </div>
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
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { ActionButton } from '@/components/ActionButton';
import { ADD_NEW_PRAYERS_PAGE_NAME, PRAYER_SESSION_PAGE_NAME, PRAYER_LIST_PAGE_NAME } from '@/utils/constants';
import { useRouter } from 'next/navigation';
import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { PrayerPointStatus } from '@/types/database';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { prayers, loading: prayersLoading } = usePrayerPoints();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  } else if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-2">You must be logged in to access this page.</p>
          <a href="/auth" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const activePrayers = prayers.filter(p => p.status !== PrayerPointStatus.ARCHIVED);
  const archivedCount = prayers.filter(p => p.status === PrayerPointStatus.ARCHIVED).length;
  const categories = [...new Set(activePrayers.map(p => p.categoryName || 'Uncategorized'))];

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to your prayer dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Choose an action to begin your prayer journey</p>
        </div>

        {/* Quick stats */}
        {!prayersLoading && prayers.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-sm text-orange-700 dark:text-orange-300">
              {activePrayers.length} active prayer{activePrayers.length !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-300">
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </span>
            {archivedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400">
                {archivedCount} archived
              </span>
            )}
          </div>
        )}

        <div className="space-y-3">
          <ActionButton
            title={PRAYER_SESSION_PAGE_NAME}
            description="Start a guided prayer session"
            onClick={() => router.push('/session')}
            variant="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <ActionButton
            title={ADD_NEW_PRAYERS_PAGE_NAME}
            description="Add and organise new prayer points"
            onClick={() => router.push('/new')}
            variant="slate"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />

          <ActionButton
            title={PRAYER_LIST_PAGE_NAME}
            description="View your prayer list"
            onClick={() => router.push('/prayer-list')}
            variant="emerald"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>
      </main>
    </div>
  );
}
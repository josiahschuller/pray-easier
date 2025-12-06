'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { ActionButton } from '@/components/ActionButton';
import { ADD_NEW_PRAYERS_PAGE_NAME, PRAYER_SESSION_PAGE_NAME, PRAYER_LIST_PAGE_NAME } from '@/utils/constants';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading state while authentication is being determined
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
    // Redirect to auth page
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

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to your prayer dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose an action to begin your prayer journey</p>
        </div>

        {/* Action Items */}
        <div className="space-y-4">
          <ActionButton
            title={PRAYER_SESSION_PAGE_NAME}
            description="Start a guided prayer session"
            onClick={() => router.push('/session')}
            icon={
              <svg className="w-6 h-6 text-orange-700 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            borderColor="border-primary"
            iconBgColor="bg-orange-100 dark:bg-orange-900/40"
            iconHoverBgColor="group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60"
            textHoverColor="group-hover:text-orange-600 dark:group-hover:text-orange-400"
            gradientFrom="from-orange-100 dark:bg-orange-50"
            gradientHoverFrom="hover:from-orange-100 dark:hover:bg-orange-100"
            arrowHoverColor="group-hover:text-orange-600 dark:group-hover:text-orange-400"
          />

          <ActionButton
            title={ADD_NEW_PRAYERS_PAGE_NAME}
            description="Add and organise new prayer points"
            onClick={() => router.push('/new')}
            icon={
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            borderColor="border-slate-500"
            iconBgColor="bg-slate-100 dark:bg-slate-800/40"
            iconHoverBgColor="group-hover:bg-slate-200 dark:group-hover:bg-slate-800/60"
            textHoverColor="group-hover:text-slate-600 dark:group-hover:text-slate-400"
            gradientFrom="from-slate-100 dark:bg-slate-900"
            gradientHoverFrom="hover:from-slate-100 dark:hover:bg-slate-900"
            arrowHoverColor="group-hover:text-slate-600 dark:group-hover:text-slate-400"
          />

          <ActionButton
            title={PRAYER_LIST_PAGE_NAME}
            description="View your prayer list"
            onClick={() => router.push('/prayer-list')}
            icon={
              <svg className="w-6 h-6 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            borderColor="border-emerald-600"
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
            iconHoverBgColor="group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50"
            textHoverColor="group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
            gradientFrom="from-emerald-50 dark:bg-emerald-950"
            gradientHoverFrom="hover:from-emerald-100 dark:hover:bg-emerald-950"
            arrowHoverColor="group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
          />
        </div>
      </main>
    </div>
  );
} 
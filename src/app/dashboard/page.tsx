'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PrayerList } from '@/components/PrayerList';
import { Navigation } from '@/components/Navigation';
import { BigCard } from '@/components/BigCard';
import { ADD_NEW_PRAYERS_PAGE_NAME, PRAYER_SESSION_PAGE_NAME } from '@/utils/constants';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  } else if (!user) {    
    // Redirect to auth page
    return (
      <div className="min-h-screen flex items-center justify-center">
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

      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <BigCard
            title={ADD_NEW_PRAYERS_PAGE_NAME}
            subtitle="Add and organise new prayer points"
            onClick={() => router.push('/new')}
          />
          <BigCard
            title={PRAYER_SESSION_PAGE_NAME}
            subtitle="Start a guided prayer session"
            onClick={() => router.push('/session')}
          />
        </div>

        {/* Prayer List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Your Prayers
          </h2>
          <PrayerList />
        </div>
      </main>
    </div>
  );
} 
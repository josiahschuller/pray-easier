'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PrayerList } from '@/components/PrayerList';
import { Navigation } from '@/components/Navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();

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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PrayerList />
      </main>
    </div>
  );
} 
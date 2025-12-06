import React from "react";
import { PrayerList } from '@/components/PrayerList';
import { Navigation } from '@/components/Navigation';

export default function PrayerListPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Your Prayers
        </h2>
        <PrayerList />
      </main>
    </div>
  );
}

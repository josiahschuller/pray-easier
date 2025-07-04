'use client';

import { usePrayerPoints } from '@/hooks/usePrayerPoints';
import { PrayerPointStatus } from '@/types/database';
import { ARCHIVED_TEXT } from '@/utils/constants';

export function PrayerList() {
  const { prayers, updatePrayer, loading } = usePrayerPoints();

  const handleResolve = (prayerId: number) => {
    updatePrayer(prayerId, { status: PrayerPointStatus.ARCHIVED });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading prayers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(
        prayers.reduce((acc, prayer) => {
          const categoryName = prayer.categoryName || 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(prayer);
          return acc;
        }, {} as Record<string, typeof prayers>)
      ).map(([categoryName, categoryPrayers]) => (
        <div key={categoryName} className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 capitalize">
              {categoryName}
            </h3>
            <div className="mt-4 space-y-4">
              {categoryPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`flex items-start justify-between ${
                    prayer.status === PrayerPointStatus.ARCHIVED ? 'opacity-50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-500">{prayer.content}</p>
                  {prayer.status !== PrayerPointStatus.ARCHIVED && (
                    <button
                      onClick={() => handleResolve(prayer.id)}
                      className="ml-4 text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      {ARCHIVED_TEXT}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {prayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prayers added yet.</p>
        </div>
      )}
    </div>
  );
}
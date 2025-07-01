'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type { PrayerPoint, PrayerCategory } from '@/types/database';

/**
 * Extended PrayerPoint type that includes category name for easier display
 */
interface PrayerPointWithCategory extends PrayerPoint {
  categoryName?: string;
}

/**
 * Return type for the usePrayerPoints hook
 */
interface UsePrayerPointsReturn {
  /** Array of prayer points with category information */
  prayers: PrayerPointWithCategory[];
  /** Function to update prayers state directly (for optimistic updates) */
  setPrayers: (prayers: PrayerPointWithCategory[] | ((prev: PrayerPointWithCategory[]) => PrayerPointWithCategory[])) => void;
  /** Loading state for all operations */
  loading: boolean;
  /** Manually refresh prayers from server */
  refresh: () => Promise<void>;
  /** Add a new prayer point */
  addPrayer: (content: string, categoryName: string) => Promise<void>;
  /** Update an existing prayer point */
  updatePrayer: (id: number, updates: Partial<PrayerPoint>) => Promise<void>;
  /** Delete a prayer point */
  deletePrayer: (id: number) => Promise<void>;
}

/**
 * API response type for prayer categories with their points
 */
interface PrayerCategoryWithPoints extends PrayerCategory {
  prayerPoints: PrayerPoint[];
}

/**
 * Custom hook for managing prayer points with full CRUD operations
 * 
 * @description
 * This hook provides a complete interface for prayer point management including:
 * - Loading prayer points from the API
 * - Creating, updating, and deleting prayer points
 * - Automatic state synchronization with the backend
 * - Loading states and error handling
 * - Toast notifications for user feedback
 * 
 * @example
 * ```tsx
 * function PrayerComponent() {
 *   const { prayers, loading, addPrayer, updatePrayer, deletePrayer } = usePrayerPoints();
 * 
 *   if (loading) return <div>Loading...</div>;
 * 
 *   return (
 *     <div>
 *       {prayers.map(prayer => (
 *         <div key={prayer.id}>
 *           <p>{prayer.content}</p>
 *           <p>Category: {prayer.categoryName}</p>
 *           <button onClick={() => updatePrayer(prayer.id, { status: 'archived' })}>
 *             Mark Resolved
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example Optimistic updates
 * ```tsx
 * const { prayers, setPrayers, updatePrayer } = usePrayerPoints();
 * 
 * const handleQuickUpdate = (prayerId: number) => {
 *   // Update UI immediately
 *   setPrayers(prevPrayers => 
 *     prevPrayers.map(prayer => 
 *       prayer.id === prayerId 
 *         ? { ...prayer, status: PrayerPointStatus.ARCHIVED }
 *         : prayer
 *     )
 *   );
 *   
 *   // Then sync with API
 *   updatePrayer(prayerId, { status: PrayerPointStatus.ARCHIVED });
 * };
 * ```
 * 
 * @returns {UsePrayerPointsReturn} Object containing prayers array and management functions
 * 
 * @remarks
 * - Requires authentication context (useAuth)
 * - Automatically loads prayers on mount and user change
 * - All API calls include proper authentication headers
 * - Errors are automatically handled with toast notifications
 * - Local state is updated optimistically for better UX
 * 
 * @limitations
 * - addPrayer currently only creates categories, not the actual prayer points
 * - API doesn't efficiently support creating categories and points in one operation
 * - No direct category management (rename, delete categories)
 */

export function usePrayerPoints(): UsePrayerPointsReturn {
  const [prayers, setPrayersState] = useState<PrayerPointWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Load all prayer points from the API
   * Automatically called on mount and when user changes
   */
  const loadPrayers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prayer points');
      }

      const data = await response.json();
      const categoriesWithPoints: PrayerCategoryWithPoints[] = data.prayerPoints || [];
      
      // Flatten the categories with points into a single array of prayers
      const flattenedPrayers: PrayerPointWithCategory[] = categoriesWithPoints.flatMap(category => 
        category.prayerPoints.map(point => ({
          ...point,
          categoryName: category.name
        }))
      );

      setPrayersState(flattenedPrayers);
    } catch (error) {
      console.error('Error loading prayers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load prayers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Add a new prayer point with category
   * @param content - The prayer content text
   * @param categoryName - The category name (will be created if doesn't exist)
   * @note Currently simplified - only creates category, not the actual prayer point
   */
  const addPrayer = useCallback(async (content: string, categoryName: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Create category first (the API will handle creating categories and points separately)
      const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prayerCategories: [{ name: categoryName }],
          prayerPoints: [], // Simplified - in real use, you'd need to handle point creation separately
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prayer');
      }

      // Refresh to get updated data
      await loadPrayers();
      
      toast.success('Prayer added successfully!');
    } catch (error) {
      console.error('Error adding prayer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add prayer');
    } finally {
      setLoading(false);
    }
  }, [user, loadPrayers]);

  /**
   * Update an existing prayer point
   * @param id - Prayer point ID
   * @param updates - Partial prayer point object with fields to update
   * @example updatePrayer(123, { status: PrayerPointStatus.ARCHIVED, content: "New text" })
   */
  const updatePrayer = useCallback(async (id: number, updates: Partial<PrayerPoint>) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prayerPoints: [{ id, ...updates }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prayer');
      }

      // Update local state immediately for better UX
      setPrayersState(prev => 
        prev.map(prayer => 
          prayer.id === id ? { ...prayer, ...updates } : prayer
        )
      );
      
    } catch (error) {
      console.error('Error updating prayer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update prayer');
      // Refresh on error to ensure consistency
      await loadPrayers();
    } finally {
      setLoading(false);
    }
  }, [user, loadPrayers]);

  /**
   * Delete a prayer point permanently
   * @param id - Prayer point ID to delete
   */
  const deletePrayer = useCallback(async (id: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prayerPointId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prayer');
      }

      // Update local state immediately
      setPrayersState(prev => prev.filter(prayer => prayer.id !== id));
      
      toast.success('Prayer deleted successfully!');
    } catch (error) {
      console.error('Error deleting prayer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete prayer');
      // Refresh on error
      await loadPrayers();
    } finally {
      setLoading(false);
    }
  }, [user, loadPrayers]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadPrayers();
    }
  }, [user, loadPrayers]);

  /**
   * Update prayers state directly for optimistic updates
   * Use this for immediate UI feedback before API calls complete
   * @param newPrayers - New prayers array or updater function
   */
  const setPrayers = useCallback((
    newPrayers: PrayerPointWithCategory[] | ((prev: PrayerPointWithCategory[]) => PrayerPointWithCategory[])
  ) => {
    const updatedPrayers = typeof newPrayers === 'function' 
      ? newPrayers(prayers) 
      : newPrayers;
    
    setPrayersState(updatedPrayers);
  }, [prayers]);

  return {
    prayers,
    setPrayers,
    loading,
    refresh: loadPrayers,
    addPrayer,
    updatePrayer,
    deletePrayer,
  };
}

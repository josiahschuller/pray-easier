'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type { PrayerPoint, PrayerCategory, PrayerPointStatus } from '@/types/database';

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
  /** Array of prayer categories */
  categories: PrayerCategory[];
  /** Function to update prayers state directly (for optimistic updates) */
  setPrayers: (prayers: PrayerPointWithCategory[] | ((prev: PrayerPointWithCategory[]) => PrayerPointWithCategory[])) => void;
  /** Function to update categories state directly (for optimistic updates) */
  setCategories: (categories: PrayerCategory[] | ((prev: PrayerCategory[]) => PrayerCategory[])) => void;
  /** Loading state for all operations */
  loading: boolean;
  /** Manually refresh prayers and categories from server */
  refresh: () => Promise<void>;
  /** Add a new prayer point */
  addPrayer: (content: string, categoryName: string) => Promise<void>;
  /** Update an existing prayer point */
  updatePrayer: (id: number, updates: PrayerPointUpdatePayload) => Promise<void>;
  /** Delete a prayer point */
  deletePrayer: (id: number) => Promise<void>;
  /** Add a new prayer category */
  addCategory: (name: string) => Promise<void>;
  /** Update an existing prayer category */
  updateCategory: (id: number, name: string) => Promise<void>;
  /** Delete a prayer category (and all its prayer points) */
  deleteCategory: (id: number) => Promise<void>;
}

/**
 * API response type for prayer categories with their points
 */
interface PrayerCategoryWithPoints extends PrayerCategory {
  prayerPoints: PrayerPoint[];
}

/**
 * Update payload for prayer points - allows string dates for API compatibility
 */
interface PrayerPointUpdatePayload {
  id?: number;
  categoryId?: string;
  content?: string;
  status?: PrayerPointStatus;
  lastTimePrayed?: string | Date;
}

/**
 * Custom hook for managing prayer points and categories with full CRUD operations
 * 
 * @description
 * This hook provides a complete interface for prayer point and category management including:
 * - Loading prayer points and categories from the API
 * - Creating, updating, and deleting prayer points and categories
 * - Automatic state synchronization with the backend
 * - Loading states and error handling
 * - Toast notifications for user feedback
 * 
 * @example
 * ```tsx
 * function PrayerComponent() {
 *   const { 
 *     prayers, 
 *     categories, 
 *     loading, 
 *     addPrayer, 
 *     updatePrayer, 
 *     deletePrayer,
 *     addCategory,
 *     updateCategory,
 *     deleteCategory
 *   } = usePrayerPoints();
 * 
 *   if (loading) return <div>Loading...</div>;
 * 
 *   return (
 *     <div>
 *       <h2>Categories</h2>
 *       {categories.map(category => (
 *         <div key={category.id}>
 *           <h3>{category.name}</h3>
 *           <button onClick={() => updateCategory(category.id, 'New Name')}>
 *             Rename
 *           </button>
 *           <button onClick={() => deleteCategory(category.id)}>
 *             Delete Category
 *           </button>
 *         </div>
 *       ))}
 *       
 *       <h2>Prayer Points</h2>
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
 * const { prayers, setPrayers, categories, setCategories, updatePrayer, updateCategory } = usePrayerPoints();
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
 * 
 * const handleQuickCategoryRename = (categoryId: number, newName: string) => {
 *   // Update UI immediately
 *   setCategories(prevCategories => 
 *     prevCategories.map(category => 
 *       category.id === categoryId 
 *         ? { ...category, name: newName }
 *         : category
 *     )
 *   );
 *   
 *   // Then sync with API
 *   updateCategory(categoryId, newName);
 * };
 * ```
 * 
 * @returns {UsePrayerPointsReturn} Object containing prayers/categories arrays and management functions
 * 
 * @remarks
 * - Requires authentication context (useAuth)
 * - Automatically loads prayers and categories on mount and user change
 * - All API calls include proper authentication headers
 * - Errors are automatically handled with toast notifications
 * - Local state is updated optimistically for better UX
 * - Deleting a category will also delete all associated prayer points
 * 
 * @limitations
 * - API requires creating categories and points in separate requests due to design limitations
 * - Creating new categories with prayer points requires two API calls in sequence
 */

export function usePrayerPoints(): UsePrayerPointsReturn {
  const [prayers, setPrayersState] = useState<PrayerPointWithCategory[]>([]);
  const [categories, setCategoriesState] = useState<PrayerCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Load all prayer points and categories from the API
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
      const prayerCategories: PrayerCategory[] = data.prayerCategories || [];
      const categoriesWithPoints: PrayerCategoryWithPoints[] = data.prayerPoints || [];
      
      // Update categories state
      setCategoriesState(prayerCategories);
      
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
   * @description If the category exists, creates the prayer point immediately. 
   * If the category doesn't exist, creates the category first, then creates the prayer point.
   */
  const addPrayer = useCallback(async (content: string, categoryName: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Find existing category or prepare to create new one
      const existingCategory = categories.find(cat => cat.name === categoryName);
      
      if (existingCategory) {
        // Create prayer point in existing category
        const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prayerCategories: [],
            prayerPoints: [{ categoryId: existingCategory.id, content }],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create prayer');
        }
      } else {
        // Create both category and prayer point in sequence
        // First, create the category
        const categoryResponse = await fetch(`/api/prayerPoints?userId=${user.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prayerCategories: [{ name: categoryName }],
            prayerPoints: [],
          }),
        });

        if (!categoryResponse.ok) {
          const errorData = await categoryResponse.json();
          throw new Error(errorData.error || 'Failed to create category');
        }
        
        // Get the updated categories from the latest state
        // We need to fetch fresh data to get the new category ID
        const freshResponse = await fetch(`/api/prayerPoints?userId=${user.id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!freshResponse.ok) {
          throw new Error('Failed to fetch updated categories');
        }
        const freshData = await freshResponse.json();
        const freshCategories: PrayerCategory[] = freshData.prayerCategories || [];
        const newCategory = freshCategories.find(cat => cat.name === categoryName);
        if (!newCategory) {
          throw new Error('Failed to retrieve newly created category');
        }

        // Now create the prayer point with the new category ID
        const prayerResponse = await fetch(`/api/prayerPoints?userId=${user.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prayerCategories: [],
            prayerPoints: [{ categoryId: newCategory.id, content }],
          }),
        });

        if (!prayerResponse.ok) {
          const errorData = await prayerResponse.json();
          throw new Error(errorData.error || 'Failed to create prayer point');
        }
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
  }, [user, categories, loadPrayers]);

  /**
   * Update an existing prayer point
   * @param id - Prayer point ID
   * @param updates - Partial prayer point object with fields to update
   * @example updatePrayer(123, { status: PrayerPointStatus.ARCHIVED, content: "New text" })
   */
  const updatePrayer = useCallback(async (id: number, updates: PrayerPointUpdatePayload) => {
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
      // Convert string dates to Date objects for local state
      const localUpdates: Partial<PrayerPoint> = {
        ...updates,
        lastTimePrayed: typeof updates.lastTimePrayed === 'string' 
          ? new Date(updates.lastTimePrayed)
          : updates.lastTimePrayed
      };
      
      setPrayersState(prev => 
        prev.map(prayer => 
          prayer.id === id ? { ...prayer, ...localUpdates } : prayer
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

  /**
   * Add a new prayer category
   * @param name - The category name
   */
  const addCategory = useCallback(async (name: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prayerCategories: [{ name }],
          prayerPoints: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      // Refresh to get updated data with new category ID
      await loadPrayers();
      
      toast.success('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add category');
    } finally {
      setLoading(false);
    }
  }, [user, loadPrayers]);

  /**
   * Update an existing prayer category
   * @param id - Category ID
   * @param name - New category name
   */
  const updateCategory = useCallback(async (id: number, name: string) => {
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
          prayerCategories: [{ id, name }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      // Update local state immediately for better UX
      setCategoriesState(prev => 
        prev.map(category => 
          category.id === id ? { ...category, name } : category
        )
      );

      // Also update prayer points that reference this category
      setPrayersState(prev => 
        prev.map(prayer => 
          prayer.categoryId === id.toString() ? { ...prayer, categoryName: name } : prayer
        )
      );
      
      toast.success('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
      // Refresh on error to ensure consistency
      await loadPrayers();
    } finally {
      setLoading(false);
    }
  }, [user, loadPrayers]);

  /**
   * Delete a prayer category and all its prayer points
   * @param id - Category ID to delete
   */
  const deleteCategory = useCallback(async (id: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/prayerPoints?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prayerCategoryId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      // Update local state immediately
      setCategoriesState(prev => prev.filter(category => category.id !== id));
      setPrayersState(prev => prev.filter(prayer => prayer.categoryId !== id.toString()));
      
      toast.success('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
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

  /**
   * Update categories state directly for optimistic updates
   * Use this for immediate UI feedback before API calls complete
   * @param newCategories - New categories array or updater function
   */
  const setCategories = useCallback((
    newCategories: PrayerCategory[] | ((prev: PrayerCategory[]) => PrayerCategory[])
  ) => {
    const updatedCategories = typeof newCategories === 'function' 
      ? newCategories(categories) 
      : newCategories;
    
    setCategoriesState(updatedCategories);
  }, [categories]);

  return {
    prayers,
    categories,
    setPrayers,
    setCategories,
    loading,
    refresh: loadPrayers,
    addPrayer,
    updatePrayer,
    deletePrayer,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}

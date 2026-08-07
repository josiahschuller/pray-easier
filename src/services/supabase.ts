import { createClient } from '@supabase/supabase-js';
import { User, PrayerCategory, PrayerPoint, PrayerPointStatus, PrayerType, PrayerTheme } from '@/types/database';

class SupabaseService {
  supabase;

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const errorMessage = 'Missing env.NEXT_PUBLIC_SUPABASE_URL';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const errorMessage = 'Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }


  getUserByEmailAddress = async (emailAddress: string): Promise<User | null> => {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('emailAddress', emailAddress)
      .single();

    if (error) {
      return null; // Return null if user not found or error occurs
    }
    return data as User;
  };

  getUserById = async (id: number): Promise<User | null> => {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      return null; // Return null if user not found or error occurs
    }
    return data as User;
  };

  createUser = async (emailAddress: string, hashedPassword: string, salt: string, name: string, accessToken: string): Promise<User> => {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ emailAddress, passwordHash: hashedPassword, salt, name, accessToken }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    return data as User;
  };

  getPrayerCategoriesByUserId = async (userId: number): Promise<PrayerCategory[]> => {
    const { data, error } = await this.supabase
      .from('prayerCategories')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Error fetching prayer categories: ${error.message}`);
    }
    return data as PrayerCategory[];
  }

  createPrayerCategory = async (userId: number, name: string): Promise<PrayerCategory> => {
    const { data, error } = await this.supabase
      .from('prayerCategories')
      .insert([{ userId, name }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating prayer category: ${error.message}`);
    }
    return data as PrayerCategory;
  }

  deletePrayerCategory = async (categoryId: number): Promise<{ success: boolean }> => {
    const { error } = await this.supabase
      .from('prayerCategories')
      .delete()
      .eq('id', categoryId);
    if (error) {
      throw new Error(`Error deleting prayer category: ${error.message}`);
    }
    return { success: true };
  }

  updatePrayerCategory = async (categoryId: number, name: string): Promise<PrayerCategory> => {
    const { data, error } = await this.supabase
      .from('prayerCategories')
      .update({ name: name })
      .eq('id', categoryId)
      .single();

    if (error) {
      throw new Error(`Error updating prayer category: ${error.message}`);
    }
    return data as PrayerCategory;
  }

  getPrayerPointsByCategoryId = async (categoryId: number): Promise<PrayerPoint[]> => {
    const { data, error } = await this.supabase
      .from('prayerPoints')
      .select('*')
      .eq('categoryId', categoryId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Error fetching prayer points: ${error.message}`);
    }
    return data as PrayerPoint[];
  }

  createPrayerPoint = async (categoryId: number, content: string, prayerType?: PrayerType, prayerTheme?: PrayerTheme): Promise<PrayerPoint> => {
    const { data, error } = await this.supabase
      .from('prayerPoints')
      .insert([{
        categoryId,
        content: content,
        prayerType,
        prayerTheme,
        status: PrayerPointStatus.ACTIVE
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating prayer point: ${error.message}`);
    }
    return data as PrayerPoint;
  }

  deletePrayerPoint = async (prayerPointId: number): Promise<{ success: boolean }> => {
    const { error } = await this.supabase
      .from('prayerPoints')
      .delete()
      .eq('id', prayerPointId);

    if (error) {
      throw new Error(`Error deleting prayer point: ${error.message}`);
    }
    return { success: true };
  }

  updatePrayerPoint = async (
    prayerPointId: number,
    categoryId?: number,
    content?: string,
    status?: PrayerPointStatus,
    lastTimePrayed?: string,
    prayerType?: PrayerType,
    prayerTheme?: PrayerTheme
  ): Promise<PrayerPoint | null> => {
    // Create an update object with only the provided fields
    const updateData: {
      categoryId?: number;
      content?: string;
      status?: PrayerPointStatus;
      lastTimePrayed?: string;
      prayerType?: PrayerType;
      prayerTheme?: PrayerTheme;
    } = {};

    // Only add properties to the update object if they are provided
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (lastTimePrayed !== undefined) updateData.lastTimePrayed = lastTimePrayed;
    if (prayerType !== undefined) updateData.prayerType = prayerType;
    if (prayerTheme !== undefined) updateData.prayerTheme = prayerTheme;

    // Only proceed with the update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return null; // Nothing to update
    }

    const { data, error } = await this.supabase
      .from('prayerPoints')
      .update(updateData)
      .eq('id', prayerPointId)
      .single();

    if (error) {
      throw new Error(`Error updating prayer point: ${error.message}`);
    }
    return data as PrayerPoint;
  }
}

export const supabaseService = new SupabaseService();

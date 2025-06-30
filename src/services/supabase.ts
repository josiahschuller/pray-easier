import { createClient } from '@supabase/supabase-js';

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

  getUserByEmailAddress = async (emailAddress: string) => {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('email_address', emailAddress)
      .single();

    if (error) {
      return null; // Return null if user not found or error occurs
    }
    return data;
  };

  createUser = async (emailAddress: string, hashedPassword: string, salt: string, name: string, accessToken: string) => {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ email_address: emailAddress, password_hash: hashedPassword, salt: salt, name: name, access_token: accessToken }])
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    return data;
  };
}

export const supabaseService = new SupabaseService();

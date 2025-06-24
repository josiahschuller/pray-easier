import { createClient } from '@supabase/supabase-js';

class SupabaseService {
  supabase;

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
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
      throw new Error(`Error fetching user: ${error.message}`);
    }
    return data;
  };

  createUser = async (emailAddress: string, hashedPassword: string, salt: string, name: string, accessToken: string) => {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ email_address: emailAddress, password: hashedPassword, salt: salt, name: name, access_token: accessToken }])
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    return data;
  };
}

export const supabaseService = new SupabaseService();

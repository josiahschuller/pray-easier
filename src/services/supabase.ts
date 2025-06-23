import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Helper function for cookies
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Custom storage implementation
const customStorage = {
  getItem: (key: string) => {
    // Try to get from cookie first for 'access_token' and 'refresh_token'
    if (key === 'supabase.auth.token' || key.includes('access_token')) {
      const cookieValue = getCookie('sb-access-token');
      if (cookieValue) {
        console.log('Retrieved access token from cookie');
        return cookieValue;
      }
    }
    
    if (key === 'supabase.auth.refreshToken' || key.includes('refresh_token')) {
      const cookieValue = getCookie('sb-refresh-token');
      if (cookieValue) {
        console.log('Retrieved refresh token from cookie');
        return cookieValue;
      }
    }
    
    // Fall back to localStorage
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }
};

console.log('Creating Supabase client with custom storage');

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: customStorage
    }
  }
);

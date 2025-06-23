'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Function to initialize the auth state
    const initAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Check active sessions and sets the user
        const { data: { session } } = await supabase.auth.getSession();
        
        // Also check for cookies as a fallback
        const hasCookies = typeof document !== 'undefined' && 
                         (document.cookie.includes('sb-access-token') || 
                          document.cookie.includes('sb-refresh-token'));
        
        console.log('Auth initialization check:', { 
          hasSession: !!session, 
          hasCookies,
          userData: session?.user ? 'User present' : 'No user'
        });
        
        if (session?.user) {
          console.log('Setting user from session');
          setUser(session.user);
          
          // Store session in localStorage as a backup
          localStorage.setItem('supabase-auth-session', JSON.stringify(session));
          
          // Ensure cookies are set
          if (session.access_token && session.refresh_token) {
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; secure; samesite=lax`;
            document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=7776000; secure; samesite=lax`;
          }
        } else if (hasCookies) {
          console.log('No session but cookies found, trying to refresh auth...');
          
          // Force a refresh of the session
          await supabase.auth.refreshSession();
          
          // Try to get user again after refresh
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            console.log('Successfully retrieved user after refresh');
            setUser(userData.user);
          } else {
            console.error('Failed to get user even after refresh with cookies present');
          }
        } else {
          console.log('No session or cookies found, user is not authenticated');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Run the initialization
    initAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { hasUser: !!session?.user });
      setUser(session?.user ?? null);
        // Update cookies when auth state changes
      if (session?.access_token && session?.refresh_token) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; secure; samesite=lax`;
        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=7776000; secure; samesite=lax`;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('Authentication error:', error.message);
      throw error;
    }

    // Update the user state immediately after successful sign-in
    if (data?.user) {
      setUser(data.user);
      
      // Manually set cookies for middleware
      if (data.session) {
        // Set session token in a cookie
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; secure; samesite=lax`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=7776000; secure; samesite=lax`;
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp(
      {
        email: email,
        password: password
      }
    );
    
    if (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    // Manually clear auth cookies
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
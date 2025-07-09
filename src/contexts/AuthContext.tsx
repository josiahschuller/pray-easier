'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Define types
type User = {
  id: number;
  emailAddress: string;
  name: string;
  accessToken: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (emailAddress: string, password: string) => Promise<void>;
  signup: (emailAddress: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    if (accessToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Invalid stored data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const clearError = () => setError(null);

  const login = async (emailAddress: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {      
      const apiPath = '/api/logIn';
      
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ emailAddress, password }),
      });      
      const responseText = await response.text();
      
      // Try to parse JSON from the text response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Server returned invalid JSON');
      }
      
      // Check if response was not ok
      if (!response.ok) {
        throw new Error(data.error || `Login failed: ${response.status}`);
      }
      
      // Validate the response data
      if (!data.accessToken) {
        throw new Error('Invalid server response: missing access token');
      }
      
      const userData: User = {
        id: data.id,
        emailAddress,
        name: data.name || 'User', // Fallback if name isn't returned
        accessToken: data.accessToken,
      };
      
      // Save to localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (emailAddress: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiPath = '/api/signUp';
      
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ emailAddress, password, name }),
      });
      
      const responseText = await response.text();
      
      // Try to parse JSON from the text response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Server returned invalid JSON');
      }
      
      // Check if response was not ok
      if (!response.ok) {
        throw new Error(data.error || `Signup failed: ${response.status}`);
      }
      
      // Access token could be directly in the response or nested in a body property
      const accessToken = data.accessToken || data.body?.accessToken;
      
      if (!accessToken) {
        throw new Error('Invalid server response: missing access token');
      }
      
      const userData: User = {
        id: data.id,
        emailAddress,
        name,
        accessToken,
      };
      
      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;


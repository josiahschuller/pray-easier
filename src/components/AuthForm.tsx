'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { checkAuthTokens } from '@/utils/auth-debug';

export function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();

  // Add an effect to handle redirection when user state changes
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignIn) {
        // Sign in the user
        await signIn(email, password);
        
        // Wait a moment for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Debug authentication tokens
        console.log('After sign-in:');
        checkAuthTokens();
        
        toast.success('Successfully signed in!');
        
        // Use a standard navigation to dashboard
        router.push('/dashboard');
      } else {
        // Sign up the user
        await signUp(email, password);
        
        toast.success('Account created! Please check your email for verification.');
        // Don't redirect immediately after signup if email verification is required
      }
    } catch (error) {
      if (error instanceof Error) {
        let errorMessage = error.message;

        // Handle common Supabase auth errors with more user-friendly messages
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'The email or password you entered is incorrect.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (errorMessage.includes('Password should be')) {
          errorMessage = 'Password should be at least 6 characters.';
        }

        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : isSignIn ? 'Sign in' : 'Sign up'}
        </button>
      </div>

      <div className="text-sm text-center">
        <button
          type="button"
          onClick={() => setIsSignIn(!isSignIn)}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          {isSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </form>
  );
}
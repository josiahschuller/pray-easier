/**
 * Utility functions for debugging authentication
 */

// Function to check for auth tokens in localStorage
export function checkAuthTokens() {
  if (typeof window === 'undefined') {
    console.log('Running on server, cannot check localStorage');
    return;
  }

  console.log('====== AUTH DEBUG ======');

  // Check for Supabase auth items in localStorage
  const authItems = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
      try {
        const value = localStorage.getItem(key);
        const parsedValue = value && value.startsWith('{') ? JSON.parse(value) : 'non-JSON value';
        authItems.push({ key, hasValue: !!value, valuePreview: typeof parsedValue });
      } catch (e) {
        authItems.push({ key, error: 'Could not parse value' });
      }
    }
  }

  console.log('Auth-related localStorage items:', authItems.length ? authItems : 'None found');
  
  // Check cookies
  console.log('Auth-related cookies:');
  const cookies = document.cookie.split(';');
  const authCookies = cookies.filter(cookie => 
    cookie.trim().startsWith('sb-') || 
    cookie.includes('supabase') || 
    cookie.includes('auth') || 
    cookie.includes('token')
  );
  
  console.log(authCookies.length ? authCookies : 'No auth cookies found');
  console.log('====== AUTH DEBUG END ======');
  
  return { authItems, authCookies };
}



class CookiesService {
  private cookies: Record<string, string> = {};

  constructor() {
    // Initialize cookies from document if available
    if (typeof document !== 'undefined') {
      const cookieArray = document.cookie.split('; ');
      cookieArray.forEach(cookie => {
        const [name, value] = cookie.split('=');
        this.cookies[name] = decodeURIComponent(value);
      });
    }
  }

  setCookie(name: string, value: string, days: number): void {
    // Set cookies in browser
    if (typeof document !== 'undefined') {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; path=/; expires=${expires}; secure; samesite=lax`;
    }
    
    // Store cookies in memory for server-side rendering
    this.cookies[name] = value;
  }

  getCookie(name: string): string | null {
    // Get cookies from browser
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
    }
    return null;
  }
}

export const cookiesService = new CookiesService();
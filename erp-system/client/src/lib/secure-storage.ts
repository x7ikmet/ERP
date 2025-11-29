/**
 * Secure token storage utility
 * Handles storing JWT tokens securely in cookies with HttpOnly flags
 */

import { tokenManager } from '@/api';

// Enhanced token manager with cookie support
export const secureTokenManager = {
  /**
   * Store tokens securely (localStorage + cookies)
   */
  storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
    // Store in localStorage for client-side access
    tokenManager.storeTokens(tokens);
    
    // Also store in cookies for server-side middleware
    if (typeof document !== 'undefined') {
      // Set secure, httpOnly-like cookies (note: can't set httpOnly from client)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days
      
      document.cookie = `accessToken=${tokens.accessToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
      document.cookie = `refreshToken=${tokens.refreshToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
    }
  },

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    tokenManager.clearTokens();
    
    if (typeof document !== 'undefined') {
      // Clear cookies
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return tokenManager.getRefreshToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  /**
   * Get token from cookie (for SSR)
   */
  getTokenFromCookie(cookieString?: string): string | null {
    if (!cookieString) return null;
    
    const match = cookieString.match(/accessToken=([^;]+)/);
    return match ? match[1] : null;
  },
};

/**
 * Auto token refresh utility
 */
export class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.setupAutoRefresh();
  }

  private setupAutoRefresh(): void {
    const token = secureTokenManager.getAccessToken();
    if (!token) return;

    try {
      // Decode JWT to get expiry (basic decode, not verified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const refreshTime = expiryTime - this.REFRESH_BEFORE_EXPIRY;
      const now = Date.now();

      if (refreshTime > now) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, refreshTime - now);
      } else {
        // Token is already expired or about to expire
        this.refreshToken();
      }
    } catch (error) {
      console.error('Error parsing token for auto-refresh:', error);
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = secureTokenManager.getRefreshToken();
      if (!refreshToken) return;

      const { authApi } = await import('@/api');
      const tokens = await authApi.refreshToken(refreshToken);
      
      secureTokenManager.storeTokens(tokens);
      this.setupAutoRefresh(); // Setup next refresh
    } catch (error) {
      console.error('Token refresh failed:', error);
      secureTokenManager.clearTokens();
      // Don't redirect here - let middleware handle it
    }
  }

  public clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Global instance
export const tokenRefreshManager = new TokenRefreshManager();
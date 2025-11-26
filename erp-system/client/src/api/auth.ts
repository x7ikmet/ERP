import { apiClient } from './client';

/**
 * Authentication API types
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/register', credentials);
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
  },

  /**
   * Logout user (if backend supports logout endpoint)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Logout endpoint might not exist, continue with client-side cleanup
      console.warn('Logout endpoint failed, continuing with client-side cleanup');
    } finally {
      // Clear tokens regardless of API call success
      tokenManager.clearTokens();
    }
  },
};

/**
 * Token management utilities
 */
export const tokenManager = {
  /**
   * Store authentication tokens in localStorage and cookies
   */
  storeTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      // Store in localStorage
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Also store in cookies for server-side middleware access
      // Use secure=false for localhost development
      const isProduction = window.location.protocol === 'https:';
      document.cookie = `accessToken=${tokens.accessToken}; path=/; ${isProduction ? 'secure;' : ''} samesite=strict; max-age=86400`;
      document.cookie = `refreshToken=${tokens.refreshToken}; path=/; ${isProduction ? 'secure;' : ''} samesite=strict; max-age=604800`;
    }
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null;
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;
  },

  /**
   * Remove stored tokens (logout)
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cookies
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
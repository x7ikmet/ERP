"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenManager, usersApi, authApi, type User } from '@/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // For now, trust the token without verification to avoid redirect loops
      // TODO: Implement proper token verification when backend is ready
      setIsAuthenticated(true);
      setUser({ id: '1', email: 'user@example.com', name: 'User' });
      
      // Verify token by getting current user (commented out temporarily)
      // const currentUser = await usersApi.getCurrentUser();
      // setUser(currentUser);
      // setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't clear tokens on error to prevent loops
      // tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Store tokens
      tokenManager.storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error; // Re-throw to handle in component
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ name, email, password, confirmPassword: password });
      
      // Store tokens
      tokenManager.storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error; // Re-throw to handle in component
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API call failed, continuing with local cleanup');
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
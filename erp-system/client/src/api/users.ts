import { apiClient } from './client';
import type { User } from './auth';

/**
 * Users API functions
 */
export const usersApi = {
  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<Omit<User, 'id'>>): Promise<User> {
    return apiClient.put<User>('/users/me', data);
  },
};
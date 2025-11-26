/**
 * @deprecated Use the new API structure from '@/api' instead
 * This file is kept for backward compatibility
 */

// Re-export from the new API structure
export { 
  authApi as auth,
  tokenManager,
  type LoginCredentials,
  type AuthTokens,
  type User,
  type LoginResponse 
} from '@/api';
// Legacy function wrappers for backward compatibility
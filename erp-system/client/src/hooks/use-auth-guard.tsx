"use client"

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  onUnauthenticated?: () => void;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    requireAuth = true,
    redirectTo = '/login',
    onUnauthenticated,
  } = options;
  
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (requireAuth && !isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        // Store current path for redirect after login
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.replace(loginUrl);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, onUnauthenticated, router]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: !requireAuth || isAuthenticated,
  };
}

// Higher-order component for route protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: UseAuthGuardOptions
) {
  return function AuthGuardedComponent(props: P) {
    const { canAccess, isLoading } = useAuthGuard(options);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!canAccess) {
      return null; // Will redirect via useAuthGuard hook
    }

    return <Component {...props} />;
  };
}
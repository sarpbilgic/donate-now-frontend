"use client";

import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { useDonationStore } from '@/lib/store';
import { configureAmplify } from '@/lib/amplify-config';

/**
 * Auth Provider
 * Initializes Amplify and manages authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAuthenticated } = useDonationStore();

  useEffect(() => {
    // Configure Amplify on mount
    configureAmplify();

    // Check current auth state
    checkAuthState();

    // Listen to auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('[Auth] User signed in');
          checkAuthState();
          break;
        case 'signedOut':
          console.log('[Auth] User signed out');
          setUser(null);
          setIsAuthenticated(false);
          break;
        case 'tokenRefresh':
          console.log('[Auth] Token refreshed');
          break;
        case 'tokenRefresh_failure':
          console.log('[Auth] Token refresh failed');
          setUser(null);
          setIsAuthenticated(false);
          break;
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAuthenticated]);

  async function checkAuthState() {
    try {
      const user = await getCurrentUser();
      console.log('[Auth] User is authenticated:', user.username);
      
      setUser({
        userId: user.userId,
        username: user.username,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.log('[Auth] User not authenticated');
      setUser(null);
      setIsAuthenticated(false);
    }
  }

  return <>{children}</>;
}


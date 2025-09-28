
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AppLayout from '@/components/app-layout';
import type { UserProfile } from '@/services/user-service';


interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginResponse: { access_token: string, Profile: UserProfile }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const syncUserObject = (userObj: UserProfile | null): UserProfile | null => {
    if (!userObj) return null;
    const synced = { ...userObj };

    // Sync phase/Company
    if (synced.Company) {
      synced.phase = synced.Company;
    } else if(synced.phase) {
      synced.Company = synced.phase;
    }
    
    // Sync name/FirstName
    if (synced.FirstName) {
      synced.name = synced.FirstName;
    } else if (synced.name) {
      synced.FirstName = synced.name;
    }

    return synced;
  }

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('session_token');
      setIsLoading(true);
      try {
        if (token) {
            const res = await fetch('/api/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (res.ok) {
              const profile: UserProfile = await res.json();
              setUser(syncUserObject(profile));
            } else {
              // Token is invalid or expired, clear it
              localStorage.removeItem('session_token');
              localStorage.removeItem('uid');
              setUser(null);
            }
        }
      } catch (error) {
        console.error("Session check failed", error);
        localStorage.removeItem('session_token');
        localStorage.removeItem('uid');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);
  
  const updateUser = useCallback((newUserState: UserProfile | null) => {
    setUser(syncUserObject(newUserState));
  }, []);

  const login = async (loginResponse: { access_token: string, Profile: UserProfile }) => {
    try {
        // 1. Store token and UID in local storage for client-side API calls
        localStorage.setItem('session_token', loginResponse.access_token);
        localStorage.setItem('uid', loginResponse.Profile.Uid);

        // 2. Call server to set the HTTP-only session cookie for middleware
        const sessionResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: loginResponse.access_token }),
        });

        const sessionData = await sessionResponse.json();
        if (!sessionResponse.ok) {
            throw new Error(sessionData.error || 'Failed to create server session.');
        }

        // 3. Update the user state in the context
        setUser(syncUserObject(loginResponse.Profile));
        return {};
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Clean up on failure
        localStorage.removeItem('session_token');
        localStorage.removeItem('uid');
        return { error: errorMessage };
    }
};


  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error("Logout API call failed:", error);
    } finally {
        localStorage.removeItem('session_token');
        localStorage.removeItem('uid');
        setUser(null);
    }
  };

  const isLoggedIn = !!user;
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (isLoading) return; // Don't redirect until session check is complete

    // If user is not logged in and not on an auth route, redirect to login
    if (!isLoggedIn && !isAuthRoute) {
      router.push('/login');
    }

    // If user is logged in and on an auth route, redirect to dashboard
    if (isLoggedIn && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, isAuthRoute, router, isLoading]);


  if (isLoading || (!isLoggedIn && !isAuthRoute) || (isLoggedIn && isAuthRoute)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <UserContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, updateUser }}>
       {isLoggedIn ? <AppLayout>{children}</AppLayout> : children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

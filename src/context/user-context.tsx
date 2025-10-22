
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
  login: (loginResponse: { access_token: string, Profile?: UserProfile }) => Promise<{ error?: string }>;
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
      setIsLoading(true);
      const token = localStorage.getItem('session_token');
      try {
        if (token) {
            const res = await fetch('/api/user', {
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
        } else {
            setUser(null);
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

  const login = async (loginResponse: { access_token: string }) => {
    const { access_token } = loginResponse;
    
    try {
        // 1. Store token for client-side API calls
        localStorage.setItem('session_token', access_token);

        // 2. Fetch profile to get UID and latest data, this works for both social and regular login
        const profileRes = await fetch('/api/user', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        if (!profileRes.ok) {
            const errorData = await profileRes.json();
            throw new Error(errorData.details || 'Failed to fetch user profile after login.');
        }
        
        const profile: UserProfile = await profileRes.json();
        localStorage.setItem('uid', profile.Uid);

        // 3. Call server to set the HTTP-only session cookie for middleware
        const sessionResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: access_token }),
        });

        if (!sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            throw new Error(sessionData.error || 'Failed to create server session.');
        }

        // 4. Update the user state in the context
        setUser(syncUserObject(profile));
        return {}; // Return success
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
    if (isLoading) return; 

    if (!isLoggedIn && !isAuthRoute) {
      router.push('/login');
    }

    if (isLoggedIn && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, isAuthRoute, router, isLoading]);


  if (isLoading && !isAuthRoute) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we are on an auth route, always render children.
  // The useEffect above will handle redirection if the user is already logged in.
  if (isAuthRoute) {
    return (
      <UserContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, updateUser }}>
        {children}
      </UserContext.Provider>
    );
  }

  // If logged in and not on an auth route, render the app layout
  if (isLoggedIn) {
      return (
        <UserContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, updateUser }}>
          <AppLayout>{children}</AppLayout>
        </UserContext.Provider>
    );
  }
  
  // This fallback will be shown briefly for non-auth routes while the redirect to /login happens.
  return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

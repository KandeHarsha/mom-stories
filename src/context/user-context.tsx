
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AppLayout from '@/components/app-layout';

// Define the shape of the user profile from LoginRadius
interface UserProfile {
    Uid: string;
    FirstName: string;
    Email: { Type: string, Value: string }[];
    [key: string]: any; // Allow other properties
}

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('session_token');
      if (token) {
        try {
          const res = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const profile = await res.json();
            setUser(profile);
          } else {
            // Token is invalid or expired, clear it
            localStorage.removeItem('session_token');
            localStorage.removeItem('uid');
            setUser(null);
          }
        } catch (error) {
          console.error("Session check failed", error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);
  

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Failed to login' };
      }
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('uid', data.profile.Uid);
      setUser(data.profile);
      return {};
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not logged in and not on an auth route, redirect to login
  if (!isLoggedIn && !isAuthRoute) {
    // Check if window is defined to avoid server-side redirects in this case
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    // Return loading state while redirecting
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  // If user is logged in and on an auth route, redirect to dashboard
  if (isLoggedIn && isAuthRoute) {
     if (typeof window !== 'undefined') {
        router.push('/dashboard');
     }
     return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, setUser }}>
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

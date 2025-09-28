// src/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const { logout } = useUser();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      // Full page redirect to clear all state.
      window.location.href = '/login';
    };
    
    performLogout();
  }, [logout]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Logging you out...</p>
      </div>
    </div>
  );
}

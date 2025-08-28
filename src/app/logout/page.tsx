// src/app/logout/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout failed', error);
      } finally {
        Cookies.remove('session');
        // Full page redirect to clear all state and re-run middleware
        window.location.href = '/login';
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Logging you out...</p>
    </div>
  );
}

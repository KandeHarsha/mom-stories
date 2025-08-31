'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout API call failed', error);
      } finally {
        // Clear client-side storage
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_profile');
        
        // Full page redirect to clear all state
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

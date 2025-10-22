
'use client';

import { Suspense } from 'react';
import LoginView from '@/components/features/login-view';
import { Loader2 } from 'lucide-react';

function LoginFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginView />
    </Suspense>
  );
}

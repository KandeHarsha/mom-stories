
// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // The middleware should handle the redirection logic.
    // This is a fallback to ensure client-side navigation also redirects.
    router.replace('/dashboard');
  }, [router]);

  return null; // Or a loading spinner
}

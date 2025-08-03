
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import DashboardView from '@/components/features/dashboard-view';
import JournalView from '@/components/features/journal-view';
import MemoryBoxView from '@/components/features/memory-box-view';
import AiSupportView from '@/components/features/ai-support-view';
import HealthTrackerView from '@/components/features/health-tracker-view';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoginPage from './login/page';
import { useRouter } from 'next/navigation';

export type View = 'dashboard' | 'journal' | 'memory-box' | 'ai-support' | 'health';


export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'journal':
        return <JournalView setActiveView={setActiveView} />;
      case 'memory-box':
        return <MemoryBoxView />;
      case 'ai-support':
        return <AiSupportView />;
      case 'health':
        return <HealthTrackerView />;
      default:
        return <DashboardView setActiveView={setActiveView} />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    // This will be handled by the redirect, but as a fallback
    return <LoginPage />;
  }

  return (
    <AppLayout activeView={activeView} setActiveView={setActiveView}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {renderView()}
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import DashboardView from '@/components/features/dashboard-view';
import JournalView from '@/components/features/journal-view';
import MemoryBoxView from '@/components/features/memory-box-view';
import AiSupportView from '@/components/features/ai-support-view';
import HealthTrackerView from '@/components/features/health-tracker-view';

export type View = 'dashboard' | 'journal' | 'memory-box' | 'ai-support' | 'health';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'journal':
        return <JournalView />;
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

  return (
    <AppLayout activeView={activeView} setActiveView={setActiveView}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {renderView()}
      </div>
    </AppLayout>
  );
}

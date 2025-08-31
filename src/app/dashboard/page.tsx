'use client';

import React from 'react';
import AppLayout from '@/components/app-layout';
import DashboardView from '@/components/features/dashboard-view';


export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardView />
      </div>
    </AppLayout>
  );
}

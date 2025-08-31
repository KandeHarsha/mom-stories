'use client';

import AppLayout from '@/components/app-layout';
import SettingsView from '@/components/features/settings-view';

export default function SettingsPage() {
  return (
    <AppLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <SettingsView />
        </div>
    </AppLayout>
  );
}

'use client';

import AppLayout from '@/components/app-layout';
import JournalView from '@/components/features/journal-view';

export default function JournalPage() {
  return (
    <AppLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <JournalView />
        </div>
    </AppLayout>
  );
}

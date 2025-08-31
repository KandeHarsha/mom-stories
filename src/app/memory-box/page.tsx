'use client';

import AppLayout from '@/components/app-layout';
import MemoryBoxView from '@/components/features/memory-box-view';

export default function MemoryBoxPage() {
  return (
    <AppLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <MemoryBoxView />
        </div>
    </AppLayout>
  );
}

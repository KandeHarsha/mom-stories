'use client';

import AppLayout from '@/components/app-layout';
import ProfileView from '@/components/features/profile-view';

export default function ProfilePage() {
  return (
    <AppLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <ProfileView />
        </div>
    </AppLayout>
  );
}

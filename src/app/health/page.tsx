'use client';

import HealthTrackerView from '@/components/features/health-tracker-view';

export default function HealthPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <HealthTrackerView />
    </div>
  );
}

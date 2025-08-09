'use client';

import AiSupportView from '@/components/features/ai-support-view';
import { Suspense } from 'react';

function AiSupportLoading() {
    // You can add a skeleton loader here if you want
    return <div>Loading chat...</div>
}

export default function AiSupportPage() {
  return (
     <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Suspense fallback={<AiSupportLoading/>}>
            <AiSupportView />
        </Suspense>
    </div>
  );
}

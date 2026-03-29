// src/app/api/ai-support/message/[messageId]/route.ts
import { NextResponse } from 'next/server';
import { updateMessageSaveStatus } from '@/services/ai-support-service';
import { auth } from '@/lib/auth';

// Update message save status
export async function PUT(request: Request, { params }: { params: { messageId: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const messageId = params.messageId;

    if (!messageId) {
      return new NextResponse(JSON.stringify({ error: 'Message ID is required.' }), { status: 400 });
    }

    const data = await request.json();
    const isSaved = data.isSaved ?? true;

    await updateMessageSaveStatus(messageId, userId, isSaved);

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Update Message Save Status Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update message.', details: errorMessage }),
      { status: 500 }
    );
  }
}

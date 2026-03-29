// src/app/api/ai-support/message/route.ts
import { NextResponse } from 'next/server';
import { getSavedMessages } from '@/services/ai-support-service';
import { auth } from '@/lib/auth';

// Get all saved messages for the user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const messages = await getSavedMessages(session.user.id);
    return new NextResponse(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error('Get Saved Messages Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch saved messages.', details: errorMessage }),
      { status: 500 }
    );
  }
}

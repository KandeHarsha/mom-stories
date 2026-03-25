// src/app/api/ai-support/sessions/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSessions } from '@/services/ai-support-service';

// Get all sessions for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get all sessions for this user, ordered by most recently updated
    const sessions = await getSessions(userId);
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get Sessions Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch sessions.', details: errorMessage }, 
      { status: 500 }
    );
  }
}

// src/app/api/ai-support/sessions/[sessionId]/messages/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSessionById, getMessagesBySession } from '@/services/ai-support-service';

// Get all messages for a specific session
export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required.' }, 
        { status: 400 }
      );
    }

    // Verify session exists and belongs to user
    const aiSession = await getSessionById(sessionId, userId);
    
    if (!aiSession) {
      return NextResponse.json(
        { error: 'Session not found.' }, 
        { status: 404 }
      );
    }

    // Get all messages for this session
    const messages = await getMessagesBySession(sessionId);
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Handle unauthorized access specifically
    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access to session.' }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch messages.', details: errorMessage }, 
      { status: 500 }
    );
  }
}

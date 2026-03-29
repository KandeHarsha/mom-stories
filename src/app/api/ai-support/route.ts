import { NextResponse } from 'next/server';
import { aiPoweredSupport, ConversationHistory } from '@/ai/flows/ai-powered-support';
import { auth } from '@/lib/auth';
import { 
  createSession, 
  updateSession, 
  createMessage, 
  getMessagesBySession,
  AIMessage 
} from '@/services/ai-support-service';

export async function POST(request: Request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { question, sessionId } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid question in request body' }, { status: 400 });
    }

    let currentSessionId: string;
    let conversationHistory: ConversationHistory[] = [];

    // Case 1: No sessionId provided - create new session
    if (!sessionId) {
      // Get AI response with empty history
      const aiResponse = await aiPoweredSupport(question, []);

      // Generate title from first 50 characters of question
      const title = question.length > 50 ? question.substring(0, 50) + '...' : question;

      // Create new session
      currentSessionId = await createSession(userId, title);

      // Save user question
      await createMessage(currentSessionId, userId, question, 'user');

      // Save AI response with metadata
      await createMessage(
        currentSessionId, 
        userId, 
        aiResponse.response, 
        'model',
        {
          model: aiResponse.model,
          promptTokenCount: aiResponse.promptTokenCount,
          candidatesTokenCount: aiResponse.candidatesTokenCount,
          totalTokenCount: aiResponse.totalTokenCount,
          thoughtsTokenCount: aiResponse.thoughtsTokenCount,
        }
      );

      return NextResponse.json({
        sessionId: currentSessionId,
        response: aiResponse.response,
      });
    }

    // Case 2: SessionId provided - continue existing conversation
    currentSessionId = sessionId;

    // Fetch all messages for this session
    const messages: AIMessage[] = await getMessagesBySession(sessionId);

    // Transform messages to ConversationHistory format
    // Only include 'user' and 'model' roles (filter out 'system' messages)
    conversationHistory = messages
      .filter(msg => msg.role === 'user' || msg.role === 'model')
      .map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }],
      }));

    // Get AI response with conversation history
    const aiResponse = await aiPoweredSupport(question, conversationHistory);

    // Update session timestamp
    await updateSession(sessionId);

    // Save user question
    await createMessage(currentSessionId, userId, question, 'user');

    // Save AI response with metadata
    await createMessage(
      currentSessionId, 
      userId, 
      aiResponse.response, 
      'model',
      {
        model: aiResponse.model,
        promptTokenCount: aiResponse.promptTokenCount,
        candidatesTokenCount: aiResponse.candidatesTokenCount,
        totalTokenCount: aiResponse.totalTokenCount,
        thoughtsTokenCount: aiResponse.thoughtsTokenCount,
      }
    );

    return NextResponse.json({
      sessionId: currentSessionId,
      response: aiResponse.response,
    });

  } catch (error) {
    console.error('Error in AI support API route:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

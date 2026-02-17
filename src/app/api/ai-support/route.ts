
import { NextResponse } from 'next/server';
import { aiPoweredSupport, ConversationHistory } from '@/ai/flows/ai-powered-support';

export async function POST(request: Request) {
  try {
    const { question, history } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Missing question in request body' }, { status: 400 });
    }

    const conversationHistory: ConversationHistory[] = history || [];
    const response = await aiPoweredSupport(question, conversationHistory);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in AI support API route:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

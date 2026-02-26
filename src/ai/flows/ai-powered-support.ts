'use server';

/**
 * @fileOverview AI-Powered Multi-turn Support for Mom Stories.
 * This handles the 2-way conversation between the mother and the AI companion.
 */

import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenAI({ apiKey });

/**
 * Interface for the conversation history
 */
export interface ConversationHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * System Instruction: This defines the AI's personality and boundaries.
 */
const SYSTEM_INSTRUCTION = `
You are the "Mom Stories Companion," a gentle, empathetic, and non-judgmental digital listener for mothers. 
Your goal is to provide emotional support and answer routine pregnancy/postpartum questions based on the "Mom Stories" philosophy.

Core Guidelines:
1. TONE: Warm, authentic, and calm. Avoid clinical or overly prescriptive language.
2. IDENTITY: You are a supportive listener, NOT a doctor or a replacement for medical professional advice.
3. PHASES: You understand three phases: Preparation (Pre-conception), The 9-Month Journey (Pregnancy), and The Fourth Trimester (Postpartum).
4. RED FLAGS: If a user mentions severe symptoms (heavy bleeding, intense sharp pain, high fever, or thoughts of self-harm), you MUST supportively urge them to contact their healthcare provider immediately.
5. TOPICS: You are knowledgeable about Folic Acid importance, morning sickness, NT scans, "Baby Blues," and C-section recovery timelines as outlined in the Mom Stories FAQ.

Example Response Style: "It sounds like you're going through a lot right now, and it’s completely normal to feel this way. Regarding your question about morning sickness..."
`;

/**
 * Main function to handle 2-way AI support
 * @param userInput - The latest message from the mother
 * @param history - The previous messages in the conversation
 */
export async function aiPoweredSupport(userInput: string, history: ConversationHistory[] = []) {
  try {
    const model = "gemini-2.5-flash"; // Or gemini-3-flash-preview when available in your region

    // If no history, use generateContent for first message
    if (history.length === 0) {
      const response = await client.models.generateContent({
        model: model,
        contents: userInput,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 1.0,
          maxOutputTokens: 1000,
        },
      });

      return {
        text: response.text || '',
        history: [
          { role: 'user' as const, parts: [{ text: userInput }] },
          { role: 'model' as const, parts: [{ text: response.text || '' }] },
        ],
      };
    }

    // For multi-turn conversations, create a chat session
    const chat = client.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0,
        maxOutputTokens: 1000,
      },
      history: history,
    });

    // Send the new message
    const response = await chat.sendMessage({ message: userInput });
    
    return {
      text: response.text || '',
      history: [...history, 
        { role: 'user' as const, parts: [{ text: userInput }] },
        { role: 'model' as const, parts: [{ text: response.text || '' }] },
      ],
    };

  } catch (error) {
    console.error("AI Support Error:", error);
    throw new Error("I'm having a little trouble connecting right now. Please try again in a moment.");
  }
}
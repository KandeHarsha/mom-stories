// src/services/ai-support-service.ts
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  getDocs, 
  orderBy, 
  where, 
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';

/**
 * Type definitions for AI Support
 */
export interface MessageMetadata {
  model?: string;
  tokens?: number;
}

export interface AISession {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: 'user' | 'model' | 'system';
  metadata?: MessageMetadata;
  isSaved: boolean;
  createdAt: Timestamp;
}

/**
 * Create a new AI support session
 */
export async function createSession(userId: string, title: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'aiSessions'), {
      userId,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating AI session: ", error);
    throw new Error('Could not create AI session.');
  }
}

/**
 * Update session's updatedAt timestamp
 */
export async function updateSession(sessionId: string): Promise<void> {
  try {
    const docRef = doc(db, 'aiSessions', sessionId);
    await updateDoc(docRef, {
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating session: ", error);
    throw new Error('Could not update session.');
  }
}

/**
 * Create a new message in a session
 */
export async function createMessage(
  sessionId: string,
  userId: string,
  content: string,
  role: 'user' | 'model' | 'system',
  metadata?: MessageMetadata
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'aiMessages'), {
      sessionId,
      userId,
      content,
      role,
      metadata: metadata || {},
      isSaved: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating message: ", error);
    throw new Error('Could not create message.');
  }
}

/**
 * Get all messages for a session ordered by creation time
 */
export async function getMessagesBySession(sessionId: string): Promise<AIMessage[]> {
  try {
    const q = query(
      collection(db, 'aiMessages'),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages: AIMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      } as AIMessage);
    });
    
    return messages;
  } catch (error) {
    console.error("Error fetching messages: ", error);
    throw new Error('Could not fetch messages.');
  }
}

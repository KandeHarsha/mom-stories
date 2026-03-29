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
  doc,
  getDoc
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
 * Get a session by ID and verify ownership
 */
export async function getSessionById(sessionId: string, userId: string): Promise<AISession | null> {
  try {
    const docRef = doc(db, 'aiSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const sessionData = docSnap.data();
    
    // Verify ownership
    if (sessionData.userId !== userId) {
      throw new Error('Unauthorized access to session.');
    }

    return {
      id: docSnap.id,
      ...sessionData,
    } as AISession;
  } catch (error) {
    console.error("Error fetching session: ", error);
    throw error;
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
 * Get all sessions for a user ordered by most recently updated
 */
export async function getSessions(userId: string): Promise<AISession[]> {
  try {
    const q = query(
      collection(db, 'aiSessions'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: AISession[] = [];
    
    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      } as AISession);
    });
    
    return sessions;
  } catch (error) {
    console.error("Error fetching sessions: ", error);
    throw new Error('Could not fetch sessions.');
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

/**
 * Update a message's isSaved status
 */
export async function updateMessageSaveStatus(
  messageId: string,
  userId: string,
  isSaved: boolean
): Promise<void> {
  try {
    const docRef = doc(db, 'aiMessages', messageId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      throw new Error('Unauthorized or message not found.');
    }

    await updateDoc(docRef, {
      isSaved,
    });
  } catch (error) {
    console.error("Error updating message save status: ", error);
    throw error;
  }
}

/**
 * Get all saved messages for a user ordered by creation time (newest first)
 */
export async function getSavedMessages(userId: string): Promise<AIMessage[]> {
  try {
    const q = query(
      collection(db, 'aiMessages'),
      where('userId', '==', userId),
      where('isSaved', '==', true),
      orderBy('createdAt', 'desc')
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
    console.error("Error fetching saved messages: ", error);
    throw new Error('Could not fetch saved messages.');
  }
}

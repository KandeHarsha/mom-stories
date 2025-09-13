
// src/services/memory-service.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, deleteDoc, doc, where, getDoc } from 'firebase/firestore';

export interface Memory {
    id: string;
    userId: string;
    title: string;
    text?: string;
    createdAt: any; // Can be Timestamp on read, FieldValue on write
    imageUrl?: string;
    voiceNoteUrl?: string;
    isAiResponse?: boolean;
}

export interface MemoryData extends Omit<Memory, 'id' | 'createdAt'> {
    createdAt: Timestamp;
}

export async function addMemory(memory: Omit<Memory, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, 'memories'), {
            ...memory,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error('Could not save memory.');
    }
}

export async function deleteMemory(memoryId: string, userId: string): Promise<void> {
    try {
        const docRef = doc(db, 'memories', memoryId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().userId !== userId) {
            throw new Error("Unauthorized or memory not found.");
        }

        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error('Could not delete memory.');
    }
}

export async function getMemories(userId: string, isAiResponse?: boolean): Promise<Memory[]> {
    try {
        const constraints = [
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        ];

        if (isAiResponse !== undefined) {
            constraints.push(where("isAiResponse", "==", isAiResponse));
        }
        
        const q = query(
            collection(db, "memories"), 
            ...constraints
        );
        const querySnapshot = await getDocs(q);
        const memories: Memory[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as MemoryData;
            const createdAt = data.createdAt.toDate();
            // Simple date formatting
            const now = new Date();
            const diffDays = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            let dateStr = `${diffDays} days ago`;
            if (diffDays === 0) dateStr = 'Today';
            if (diffDays === 1) dateStr = 'Yesterday';

            memories.push({
                ...data,
                id: doc.id,
                createdAt: dateStr
            });
        });
        return memories;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error('Could not fetch memories.');
    }
}

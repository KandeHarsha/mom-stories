
// src/services/memory-service.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, deleteDoc, doc, where } from 'firebase/firestore';
import { uploadFileAndGetURL } from './journal-service';

export interface Memory {
    id: string;
    userId: string;
    title: string;
    text?: string;
    createdAt: any; // Can be Timestamp on read, FieldValue on write
    imageUrl?: string;
    voiceNoteUrl?: string;
}

export interface MemoryData extends Omit<Memory, 'id' | 'createdAt'> {
    createdAt: Timestamp;
}

export async function addMemory(memory: Omit<Memory, 'id' | 'createdAt'>) {
    try {
        await addDoc(collection(db, 'memories'), {
            ...memory,
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error('Could not save memory.');
    }
}

export async function deleteMemory(memoryId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'memories', memoryId));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error('Could not delete memory.');
    }
}

export async function getMemories(userId: string): Promise<Memory[]> {
    try {
        // In a real app, you would add a where("userId", "==", userId) clause.
        // For now, we fetch all entries for the dummy user.
        const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
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

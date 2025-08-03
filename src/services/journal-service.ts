// src/services/journal-service.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface JournalEntry {
    userId: string;
    title: string;
    content: string;
    createdAt: any;
    imageUrl?: string;
    tags?: string[];
}

export async function addJournalEntry(entry: Omit<JournalEntry, 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, 'journalEntries'), {
            ...entry,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error('Could not save journal entry.');
    }
}
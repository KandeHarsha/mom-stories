// src/services/journal-service.ts
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface JournalEntry {
    id: string;
    userId: string;
    title: string;
    content: string;
    createdAt: any; // Can be Timestamp on read, FieldValue on write
    imageUrl?: string;
    tags?: string[];
}

export interface JournalEntryData extends Omit<JournalEntry, 'id' | 'createdAt'> {
    createdAt: Timestamp;
}

export async function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>) {
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

export async function uploadImageAndGetURL(imageFile: File, userId: string): Promise<string> {
    if (!imageFile) {
        throw new Error("No image file provided.");
    }
    const storageRef = ref(storage, `journal-images/${userId}/${Date.now()}-${imageFile.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (e) {
        console.error("Error uploading image: ", e);
        throw new Error("Could not upload image.");
    }
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
        // In a real app, you would add a where("userId", "==", userId) clause.
        // For now, we fetch all entries for the dummy user.
        const q = query(collection(db, "journalEntries"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as JournalEntryData;
            const createdAt = data.createdAt.toDate();
            // Simple date formatting, can be improved with a library like date-fns
            const now = new Date();
            const diffDays = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            let dateStr = `${diffDays} days ago`;
            if (diffDays === 0) dateStr = 'Today';
            if (diffDays === 1) dateStr = 'Yesterday';


            entries.push({
                ...data,
                id: doc.id,
                createdAt: dateStr
            });
        });
        return entries;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error('Could not fetch journal entries.');
    }
}

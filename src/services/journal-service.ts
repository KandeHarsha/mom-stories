// src/services/journal-service.ts
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, deleteDoc, doc, updateDoc, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";

export interface JournalEntry {
    id: string;
    userId: string;
    title: string;
    content: string;
    createdAt: any; // Can be Timestamp on read, FieldValue on write
    imageUrl?: string;
    voiceNoteUrl?: string;
    tags?: string[];
}

export interface JournalEntryData extends Omit<JournalEntry, 'id' | 'createdAt'> {
    createdAt: Timestamp;
}

export async function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'voiceNoteUrl'> & { voiceNoteUrl?: string }) {
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

export async function updateJournalEntry(entryId: string, userId: string, data: Partial<Pick<JournalEntry, 'title' | 'content'>>): Promise<void> {
    try {
        const docRef = doc(db, 'journalEntries', entryId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().userId !== userId) {
            throw new Error("Unauthorized or entry not found.");
        }

        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error('Could not update journal entry.');
    }
}

export async function deleteJournalEntry(entryId: string, userId: string): Promise<void> {
    try {
        const docRef = doc(db, 'journalEntries', entryId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().userId !== userId) {
            throw new Error("Unauthorized or entry not found.");
        }

        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error('Could not delete journal entry.');
    }
}

function getFileExtension(mimeType: string): string {
    const parts = mimeType.split('/');
    return parts[parts.length - 1];
}

export async function uploadFileAndGetURL(file: File | ArrayBuffer, userId: string, folder: string): Promise<string> {
    if (!file) {
        throw new Error("No file data provided.");
    }

    const contentType = file instanceof File ? file.type : (file as any).type;
    if (!contentType) {
        throw new Error("Could not determine file type.");
    }
    
    // Generate a unique filename to avoid issues with iPhone uploads providing generic names
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${getFileExtension(contentType)}`;

    const storageRef = ref(storage, `${folder}/${userId}/${uniqueFileName}`);
    
    try {
        const metadata = { contentType };
        const uploadData = file instanceof File ? file : new Uint8Array(file);

        const uploadTask = await uploadBytesResumable(storageRef, uploadData, metadata);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        return downloadURL;
    } catch (e) {
        console.error("Error uploading file: ", e);
        throw new Error("Could not upload file.");
    }
}


export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
        const q = query(
            collection(db, "journalEntries"), 
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
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

// src/services/account-deletion-service.ts
import { db, storage } from '@/lib/firebase';
import {
    collection,
    doc,
    deleteDoc,
    getDocs,
    query,
    where,
    writeBatch,
    type DocumentReference,
} from 'firebase/firestore';
import { deleteObject, listAll, ref } from 'firebase/storage';

// Firestore enforces a 500-write cap per batch.
const BATCH_LIMIT = 500;

// Collections where documents are keyed to the user via a field (queried, not doc-id lookup).
const USER_KEYED_COLLECTIONS: { name: string; field: string }[] = [
    { name: 'children', field: 'parentId' },
    { name: 'journalEntries', field: 'userId' },
    { name: 'memories', field: 'userId' },
    { name: 'medications', field: 'userId' },
    { name: 'userVaccinationStatus', field: 'userId' },
    { name: 'appointments', field: 'userId' },
    { name: 'pregnancies', field: 'userId' },
    { name: 'pushTokens', field: 'userId' },
    { name: 'aiSessions', field: 'userId' },
    { name: 'aiMessages', field: 'userId' },
    { name: 'notification_registrations', field: 'userId' },
    { name: 'customerSupport', field: 'userId' },
    { name: 'fitnessData', field: 'userId' },
];

// Firebase Storage folders that hold per-user uploads.
const USER_STORAGE_FOLDERS = ['journal-images', 'journal-voice-notes'];

async function deleteInBatches(docRefs: DocumentReference[]): Promise<void> {
    for (let i = 0; i < docRefs.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        docRefs.slice(i, i + BATCH_LIMIT).forEach((docRef) => batch.delete(docRef));
        await batch.commit();
    }
}

async function deleteCollectionByField(collectionName: string, field: string, userId: string): Promise<void> {
    const q = query(collection(db, collectionName), where(field, '==', userId));
    const snapshot = await getDocs(q);
    await deleteInBatches(snapshot.docs.map((docSnap) => docSnap.ref));
}

async function deleteStorageFolder(path: string): Promise<void> {
    const folderRef = ref(storage, path);
    const { items } = await listAll(folderRef);
    await Promise.all(items.map((item) => deleteObject(item)));
}

/**
 * Purges all Firestore data and Storage files owned by a user ahead of account deletion.
 * Each collection/folder is purged independently — a failure in one does not block the
 * others, since leaving some orphaned data is preferable to leaving the account stuck
 * and undeletable.
 */
export async function purgeUserData(userId: string): Promise<void> {
    for (const { name, field } of USER_KEYED_COLLECTIONS) {
        try {
            await deleteCollectionByField(name, field, userId);
        } catch (e) {
            console.error(`Error purging '${name}' for user ${userId}:`, e);
        }
    }

    try {
        await deleteDoc(doc(db, 'userProfiles', userId));
    } catch (e) {
        console.error(`Error purging userProfiles doc for user ${userId}:`, e);
    }

    for (const folder of USER_STORAGE_FOLDERS) {
        try {
            await deleteStorageFolder(`${folder}/${userId}`);
        } catch (e) {
            console.error(`Error purging storage folder '${folder}/${userId}':`, e);
        }
    }
}

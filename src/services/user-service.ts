// src/services/user-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phase: 'preparation' | 'pregnancy' | 'fourth-trimester' | 'beyond' | '';
    updatedAt: any;
    createdAt: any;
    // From LoginRadius
    Uid: string;
    FirstName: string;
    Email: { Type: string, Value: string }[];
}

export async function createUserProfile(userId: string, data: { name: string, email: string }) {
     try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                name: data.name,
                email: data.email,
                phase: '', // Default phase
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
    } catch (e) {
        console.error("Error creating user profile: ", e);
        throw new Error('Could not create user profile.');
    }
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Convert Timestamp to a serializable format (ISO string)
            const profileData = {
                id: docSnap.id,
                ...data,
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as UserProfile;
            return profileData;
        } else {
             // If firestore profile doesn't exist, maybe it should be created?
             // For now, returning null is safer.
            return null;
        }
    } catch (e) {
        console.error("Error getting user profile: ", e);
        throw new Error('Could not fetch user profile.');
    }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'Uid' | 'Email'>>) {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
        console.error("Error updating user profile: ", e);
        throw new Error('Could not update user profile.');
    }
}

// src/services/user-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phase: 'preparation' | 'pregnancy' | 'fourth-trimester' | 'beyond' | '';
    updatedAt: any;
    createdAt: any;
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
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as UserProfile;
        } else {
            // It might be better to create a profile here if one doesn't exist.
            // For now, returning null is safer.
            console.warn(`No profile found for userId: ${userId}`);
            return null;
        }
    } catch (e) {
        console.error("Error getting user profile: ", e);
        throw new Error('Could not fetch user profile.');
    }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating user profile: ", e);
        throw new Error('Could not update user profile.');
    }
}

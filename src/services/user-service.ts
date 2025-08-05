
// src/services/user-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    phase: 'preparation' | 'pregnancy' | 'fourth-trimester' | 'beyond' | '';
    updatedAt: any;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as UserProfile;
        } else {
            // Optionally, create a default profile
            const defaultProfile = { phase: '', updatedAt: serverTimestamp() };
            await setDoc(docRef, defaultProfile);
            return { id: userId, ...defaultProfile };
        }
    } catch (e) {
        console.error("Error getting user profile: ", e);
        throw new Error('Could not fetch user profile.');
    }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id'>>) {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
        console.error("Error updating user profile: ", e);
        throw new Error('Could not update user profile.');
    }
}

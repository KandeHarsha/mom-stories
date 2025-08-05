
// src/services/user-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phase: 'preparation' | 'pregnancy' | 'fourth-trimester' | 'beyond' | '';
    updatedAt: any;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Convert Timestamp to a serializable format (ISO string)
            const profileData = {
                id: docSnap.id,
                name: data.name || 'Mother', // fallback for existing profiles
                email: data.email || 'mom@example.com', // fallback for existing profiles
                ...data,
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as UserProfile;
            return profileData;
        } else {
            // Optionally, create a default profile
            const defaultProfile = { 
                name: 'Mother',
                email: 'mom@example.com',
                phase: '', 
                updatedAt: serverTimestamp() 
            };
            await setDoc(docRef, defaultProfile);
            return { id: userId, ...defaultProfile, updatedAt: new Date().toISOString() };
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

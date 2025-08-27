
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
}

export async function createUserProfile(userId: string, data: { name: string, email: string }) {
     try {
        const docRef = doc(db, 'userProfiles', userId);
        await setDoc(docRef, {
            ...data,
            phase: '', // Default phase
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error creating user profile: ", e);
        throw new Error('Could not create user profile.');
    }
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    // If no userId is provided, fallback to dummy for now. This will be removed later.
    const finalUserId = userId || 'dummy-user-id';
    
    try {
        const docRef = doc(db, 'userProfiles', finalUserId);
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
            // For the dummy user, create a default profile if it doesn't exist
            if (finalUserId === 'dummy-user-id') {
                const defaultProfile = { 
                    name: 'Sara',
                    email: 'sara@example.com',
                    phase: 'pregnancy', 
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp(),
                };
                await setDoc(docRef, defaultProfile);
                return { id: finalUserId, ...defaultProfile, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
            }
            return null; // For real users, if no profile exists, return null.
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

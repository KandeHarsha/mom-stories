
// src/services/user-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Vaccination } from './vaccination-service';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phase: 'preparation' | 'pregnancy' | 'fourth_trimester' | 'beyond' | '';
    updatedAt: any;
    createdAt: any;
    vaccinations?: Vaccination[];
    // From LoginRadius
    Uid: string;
    FirstName: string;
    Email: { Type: string, Value: string }[];
    Company: 'preparation' | 'pregnancy' | 'fourth_trimester' | 'beyond' | '';
}

// src/services/profile-service.ts
export async function updateProfileApi(data: { name: string; phase: string; userId: string }) {
  try {
    const token = localStorage.getItem('session_token');
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { error: (error as Error).message };
  }
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
            console.log(`No profile found for user ${userId}, creating one.`);
            // This part might need to be adjusted based on where you get the initial name/email
            // For now, it will create a placeholder.
            const defaultProfile = { 
                name: 'New User',
                email: 'newuser@example.com',
                phase: '', 
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            };
            await setDoc(docRef, defaultProfile);
            return { id: userId, ...defaultProfile, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() } as UserProfile;
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

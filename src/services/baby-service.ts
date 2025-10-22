
// src/services/baby-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, collection, addDoc } from 'firebase/firestore';
import { updateUserProfile } from './user-service';

export interface BabyProfile {
    id: string;
    parentId: string;
    name: string;
    birthday: any; // Can be Timestamp on read, Date on write
    gender: 'Male' | 'Female' | 'Other';
    height: { value: number; date: any }[];
    weight: { value: number; date: any }[];
    createdAt: any;
}

interface CreateBabyProfileInput {
    parentId: string;
    name: string;
    birthday: Date;
    birthHeight: number;
    birthWeight: number;
    gender: 'Male' | 'Female' | 'Other';
}

export async function createBabyProfile(input: CreateBabyProfileInput): Promise<string> {
    try {
        const creationDate = new Date();
        
        const babyDocRef = await addDoc(collection(db, 'babies'), {
            parentId: input.parentId,
            name: input.name,
            birthday: Timestamp.fromDate(input.birthday),
            gender: input.gender,
            height: [{ value: input.birthHeight, date: creationDate }],
            weight: [{ value: input.birthWeight, date: creationDate }],
            createdAt: serverTimestamp(),
        });

        // Link this new baby ID to the user's profile
        await updateUserProfile(input.parentId, { babyId: babyDocRef.id });

        return babyDocRef.id;
    } catch (e) {
        console.error("Error creating baby profile: ", e);
        throw new Error('Could not create baby profile.');
    }
}


export async function getBabyProfile(babyId: string): Promise<BabyProfile | null> {
    if (!babyId) return null;
    
    try {
        const docRef = doc(db, 'babies', babyId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Convert Timestamps to a serializable format (ISO string)
            const profileData: BabyProfile = {
                id: docSnap.id,
                parentId: data.parentId,
                name: data.name,
                gender: data.gender,
                birthday: (data.birthday as Timestamp)?.toDate().toISOString(),
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                height: data.height.map((h: { value: number, date: Timestamp }) => ({
                    value: h.value,
                    date: h.date.toDate().toISOString(),
                })),
                weight: data.weight.map((w: { value: number, date: Timestamp }) => ({
                    value: w.value,
                    date: w.date.toDate().toISOString(),
                })),
            };
            return profileData;
        } else {
            console.warn(`No baby profile found for ID ${babyId}.`);
            return null;
        }
    } catch (e) {
        console.error("Error getting baby profile: ", e);
        throw new Error('Could not fetch baby profile.');
    }
}

    
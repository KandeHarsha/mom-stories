// src/services/medication-service.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, deleteDoc, doc, updateDoc, where, getDoc } from 'firebase/firestore';

export type MedicationType = 'tablet' | 'tonic' | 'powder' | 'drops';
export type MedicationFrequency = 'daily' | 'weekly';

export interface ReminderTime {
    hour: number;   // 0–23
    minute: number; // 0–59
}

export interface Medication {
    id: string;
    userId: string;
    title: string;
    frequency?: MedicationFrequency;
    dosage?: string;
    type?: MedicationType;
    reminderTime?: ReminderTime;
    weekday?: number;         // 0 (Sun) – 6 (Sat), applicable when frequency = 'weekly'
    notificationId?: string;  // opaque ID for push notification scheduling
    createdAt?: string;
    updatedAt?: string;
}

export interface MedicationData extends Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const VALID_MEDICATION_TYPES: MedicationType[] = ['tablet', 'tonic', 'powder', 'drops'];
export const VALID_FREQUENCIES: MedicationFrequency[] = ['daily', 'weekly'];

export function isValidMedicationType(type: string): type is MedicationType {
    return VALID_MEDICATION_TYPES.includes(type as MedicationType);
}

export function isValidFrequency(frequency: string): frequency is MedicationFrequency {
    return VALID_FREQUENCIES.includes(frequency as MedicationFrequency);
}

export async function addMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'medications'), {
            ...medication,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding medication: ", e);
        throw new Error('Could not save medication.');
    }
}

export async function getMedications(userId: string): Promise<Medication[]> {
    try {
        const q = query(
            collection(db, "medications"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as MedicationData;
            return {
                id: doc.id,
                userId: data.userId,
                title: data.title,
                frequency: data.frequency,
                dosage: data.dosage,
                type: data.type,
                reminderTime: data.reminderTime,
                weekday: data.weekday,
                notificationId: data.notificationId,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate()?.toISOString(),
            };
        });
    } catch (e) {
        console.error("Error getting medications: ", e);
        throw new Error('Could not retrieve medications.');
    }
}

export async function getMedicationById(medicationId: string, userId: string): Promise<Medication | null> {
    try {
        const docRef = doc(db, 'medications', medicationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data() as MedicationData;

        if (data.userId !== userId) {
            throw new Error("Unauthorized access to medication.");
        }

        return {
            id: docSnap.id,
            userId: data.userId,
            title: data.title,
            frequency: data.frequency,
            dosage: data.dosage,
            type: data.type,
            reminderTime: data.reminderTime,
            weekday: data.weekday,
            notificationId: data.notificationId,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate()?.toISOString(),
        };
    } catch (e) {
        console.error("Error getting medication: ", e);
        throw e;
    }
}

export async function updateMedication(
    medicationId: string,
    userId: string,
    data: Partial<Pick<Medication, 'title' | 'frequency' | 'dosage' | 'type' | 'reminderTime' | 'weekday' | 'notificationId'>>
): Promise<void> {
    try {
        const docRef = doc(db, 'medications', medicationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().userId !== userId) {
            throw new Error("Unauthorized or medication not found.");
        }

        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating medication: ", e);
        throw e;
    }
}

export async function deleteMedication(medicationId: string, userId: string): Promise<void> {
    try {
        const docRef = doc(db, 'medications', medicationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().userId !== userId) {
            throw new Error("Unauthorized or medication not found.");
        }

        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting medication: ", e);
        throw new Error('Could not delete medication.');
    }
}

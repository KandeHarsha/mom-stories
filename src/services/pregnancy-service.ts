import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    addDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';

export type PregnancyStatus = 'active' | 'completed' | 'miscarried';
export type CalculationMethod = 'lmp' | 'dueDate';
export type PregnancyType = 'singleton' | 'twins' | 'triplets' | 'other';

export interface PregnancyRecord {
    id: string;
    userId: string;
    calculationMethod: CalculationMethod;
    dueDate: string;
    lmpDate?: string;
    cycleLengthDays?: number;
    babyNickname?: string;
    pregnancyType: PregnancyType;
    status: PregnancyStatus;
    createdAt: string;
    updatedAt: string;
}

interface CreatePregnancyInput {
    userId: string;
    dueDate: Date;
    calculationMethod?: CalculationMethod;
    lmpDate?: Date;
    cycleLengthDays?: number;
    babyNickname?: string;
    pregnancyType?: PregnancyType;
}

interface UpdatePregnancyInput {
    babyNickname?: string;
    dueDate?: Date;
    status?: PregnancyStatus;
}

export async function createPregnancy(input: CreatePregnancyInput): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'pregnancies'), {
            userId: input.userId,
            calculationMethod: input.calculationMethod ?? 'lmp',
            dueDate: Timestamp.fromDate(input.dueDate),
            lmpDate: input.lmpDate ? Timestamp.fromDate(input.lmpDate) : null,
            cycleLengthDays: input.cycleLengthDays ?? null,
            babyNickname: input.babyNickname ?? null,
            pregnancyType: input.pregnancyType ?? 'singleton',
            status: 'active' as PregnancyStatus,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (e) {
        console.error('Error creating pregnancy:', e);
        throw new Error('Could not create pregnancy record.');
    }
}

export async function getPregnancy(pregnancyId: string): Promise<PregnancyRecord | null> {
    if (!pregnancyId) return null;

    try {
        const docRef = doc(db, 'pregnancies', pregnancyId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();

        return {
            id: docSnap.id,
            userId: data.userId,
            calculationMethod: data.calculationMethod,
            dueDate: (data.dueDate as Timestamp)?.toDate().toISOString(),
            lmpDate: data.lmpDate ? (data.lmpDate as Timestamp).toDate().toISOString() : undefined,
            cycleLengthDays: data.cycleLengthDays ?? undefined,
            babyNickname: data.babyNickname ?? undefined,
            pregnancyType: data.pregnancyType,
            status: data.status,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
        };
    } catch (e) {
        console.error('Error fetching pregnancy:', e);
        throw new Error('Could not fetch pregnancy record.');
    }
}

export async function getActivePregnancyByUserId(userId: string): Promise<PregnancyRecord | null> {
    try {
        const q = query(
            collection(db, 'pregnancies'),
            where('userId', '==', userId),
            where('status', '==', 'active')
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();

        return {
            id: docSnap.id,
            userId: data.userId,
            calculationMethod: data.calculationMethod,
            dueDate: (data.dueDate as Timestamp)?.toDate().toISOString(),
            lmpDate: data.lmpDate ? (data.lmpDate as Timestamp).toDate().toISOString() : undefined,
            cycleLengthDays: data.cycleLengthDays ?? undefined,
            babyNickname: data.babyNickname ?? undefined,
            pregnancyType: data.pregnancyType,
            status: data.status,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
        };
    } catch (e) {
        console.error('Error querying active pregnancy:', e);
        throw new Error('Could not query active pregnancy.');
    }
}

export async function updatePregnancy(pregnancyId: string, input: UpdatePregnancyInput): Promise<PregnancyRecord> {
    const docRef = doc(db, 'pregnancies', pregnancyId);

    const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
    };

    if (input.babyNickname !== undefined) updates.babyNickname = input.babyNickname;
    if (input.dueDate !== undefined) updates.dueDate = Timestamp.fromDate(input.dueDate);
    if (input.status !== undefined) updates.status = input.status;

    try {
        await updateDoc(docRef, updates);

        const updated = await getPregnancy(pregnancyId);
        if (!updated) throw new Error('Pregnancy record not found after update.');
        return updated;
    } catch (e) {
        console.error('Error updating pregnancy:', e);
        throw new Error('Could not update pregnancy record.');
    }
}

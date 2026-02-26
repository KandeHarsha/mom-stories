// src/services/appointment-service.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, doc, updateDoc, where, getDoc } from 'firebase/firestore';

export interface Appointment {
    id: string;
    userId: string;
    date: string; // ISO date string
    doctor?: string;
    doctorNotes?: string;
    medications?: string;
    createdAt: any; // Can be Timestamp on read, FieldValue on write
    updatedAt?: any;
}

export interface AppointmentData extends Omit<Appointment, 'id' | 'createdAt'> {
    createdAt: Timestamp;
}

export async function addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'doctorNotes' | 'medications'>) {
    try {
        const docRef = await addDoc(collection(db, 'appointments'), {
            ...appointment,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding appointment: ", e);
        throw new Error('Could not save appointment.');
    }
}

export async function updateAppointment(appointmentId: string, userId: string, data: Partial<Pick<Appointment, 'doctorNotes' | 'medications'>>): Promise<void> {
    try {
        const docRef = doc(db, 'appointments', appointmentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error("Appointment not found.");
        }

        if (docSnap.data().userId !== userId) {
            throw new Error("Unauthorized.");
        }

        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating appointment: ", e);
        throw new Error('Could not update appointment.');
    }
}

export async function getAppointments(userId: string): Promise<Appointment[]> {
    try {
        const q = query(
            collection(db, "appointments"), 
            where("userId", "==", userId),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const appointments: Appointment[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as AppointmentData;
            appointments.push({
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.() || null,
            });
        });
        return appointments;
    } catch (e) {
        console.error("Error getting appointments: ", e);
        throw new Error('Could not fetch appointments.');
    }
}

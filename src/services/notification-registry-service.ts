// src/services/notification-registry-service.ts
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    getDocs,
    where,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    Timestamp,
} from 'firebase/firestore';

export type NotificationSourceType = 'medicine' | 'child_vaccine' | 'appointment';
export type NotificationStatus = 'active' | 'cancelled' | 'delivered';

export const VALID_SOURCE_TYPES: NotificationSourceType[] = ['medicine', 'child_vaccine', 'appointment'];
export const VALID_STATUSES: NotificationStatus[] = ['active', 'cancelled', 'delivered'];

export interface NotificationTrigger {
    hour?: number;
    minute?: number;
    repeats?: boolean;
    [key: string]: unknown;
}

export interface NotificationRegistration {
    id: string;
    userId: string;
    expoNotificationId: string;
    sourceType: NotificationSourceType;
    sourceId: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    trigger: NotificationTrigger;
    scheduledAt: string;
    repeats: boolean;
    status: NotificationStatus;
    deviceId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationRegistrationData extends Omit<NotificationRegistration, 'id' | 'createdAt' | 'updatedAt'> {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export async function addNotificationRegistration(
    registration: Omit<NotificationRegistration, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'notification_registrations'), {
            ...registration,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error('Error adding notification registration:', e);
        throw new Error('Could not save notification registration.');
    }
}

export async function getNotificationRegistrations(userId: string): Promise<NotificationRegistration[]> {
    try {
        const q = query(
            collection(db, 'notification_registrations'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => {
            const data = docSnap.data() as NotificationRegistrationData;
            return {
                id: docSnap.id,
                userId: data.userId,
                expoNotificationId: data.expoNotificationId,
                sourceType: data.sourceType,
                sourceId: data.sourceId,
                title: data.title,
                body: data.body,
                data: data.data,
                trigger: data.trigger,
                scheduledAt: data.scheduledAt,
                repeats: data.repeats,
                status: data.status,
                deviceId: data.deviceId,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate()?.toISOString(),
            };
        });
    } catch (e) {
        console.error('Error getting notification registrations:', e);
        throw new Error('Could not retrieve notification registrations.');
    }
}

export async function updateNotificationRegistration(
    registrationId: string,
    userId: string,
    updates: Partial<Pick<NotificationRegistration, 'expoNotificationId' | 'title' | 'body' | 'data' | 'trigger' | 'scheduledAt' | 'repeats' | 'status' | 'deviceId'>>
): Promise<void> {
    try {
        const docRef = doc(db, 'notification_registrations', registrationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Notification registration not found.');
        }

        const data = docSnap.data() as NotificationRegistrationData;
        if (data.userId !== userId) {
            throw new Error('Unauthorized access to notification registration.');
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error('Error updating notification registration:', e);
        if (e instanceof Error) throw e;
        throw new Error('Could not update notification registration.');
    }
}

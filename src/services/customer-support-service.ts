// src/services/customer-support-service.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, where, doc, updateDoc } from 'firebase/firestore';

export interface CustomerSupportTicket {
    id: string;
    type: 'bugReport' | 'featureRequest';
    userId?: string;
    email?: string;
    query: string;
    status: string;
    createdAt: any;
    updatedAt: any;
}

export interface CustomerSupportTicketData extends Omit<CustomerSupportTicket, 'id'> {
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export async function createCustomerSupportTicket(
    ticketData: {
        type: 'bugReport' | 'featureRequest';
        userId?: string;
        email?: string;
        query: string;
        status: string;
    }
) {
    try {
        const docRef = await addDoc(collection(db, 'customerSupport'), {
            ...ticketData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding customer support ticket: ", e);
        throw new Error('Could not save customer support ticket.');
    }
}

export async function getCustomerSupportTickets(userId?: string): Promise<CustomerSupportTicket[]> {
    try {
        let q;
        if (userId) {
            q = query(
                collection(db, "customerSupport"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
        } else {
            q = query(
                collection(db, "customerSupport"),
                orderBy("createdAt", "desc")
            );
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as CustomerSupportTicket));
    } catch (e) {
        console.error("Error getting customer support tickets: ", e);
        throw new Error('Could not retrieve customer support tickets.');
    }
}

export async function updateCustomerSupportTicketStatus(
    ticketId: string,
    status: string
): Promise<void> {
    try {
        const docRef = doc(db, 'customerSupport', ticketId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error updating customer support ticket status: ", e);
        throw new Error('Could not update customer support ticket status.');
    }
}

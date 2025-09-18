// src/services/vaccination-service.ts
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, writeBatch, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';

export interface Vaccination {
    id: string;
    userId: string;
    name: string;
    age: string;
    dose: string;
    status: boolean;
    description: string;
    order: number;
}

const defaultVaccinationSchedule: Omit<Vaccination, 'id' | 'userId' | 'status'>[] = [
    { order: 1, name: 'Hepatitis B (HepB)', age: 'Birth', dose: '1st', description: 'Protects against Hepatitis B, a liver disease that can be serious. The first shot is usually given within 24 hours of birth.' },
    { order: 2, name: 'Hepatitis B (HepB)', age: '1-2 months', dose: '2nd', description: 'The second dose of the Hepatitis B vaccine series, continuing protection.' },
    { order: 3, name: 'Rotavirus (RV)', age: '2 months', dose: '1st', description: 'Protects against rotavirus, which causes severe diarrhea, vomiting, fever, and abdominal pain, mostly in babies and young children.' },
    { order: 4, name: 'DTaP', age: '2 months', dose: '1st', description: 'Protects against Diphtheria, Tetanus, and Pertussis (whooping cough).' },
    { order: 5, name: 'Hib', age: '2 months', dose: '1st', description: 'Protects against Haemophilus influenzae type b, a type of bacteria that can cause serious illness, including meningitis and pneumonia.' },
    { order: 6, name: 'Pneumococcal (PCV13)', age: '2 months', dose: '1st', description: 'Protects against pneumococcal disease, which can lead to ear infections, pneumonia, and meningitis.' },
    { order: 7, name: 'Polio (IPV)', age: '2 months', dose: '1st', description: 'Protects against polio, a disabling and life-threatening disease caused by the poliovirus.' },
    { order: 8, name: 'Rotavirus (RV)', age: '4 months', dose: '2nd', description: 'Second dose to build immunity against rotavirus.' },
    { order: 9, name: 'DTaP', age: '4 months', dose: '2nd', description: 'Second dose of the DTaP series.' },
    { order: 10, name: 'Hib', age: '4 months', dose: '2nd', description: 'Second dose of the Hib series.' },
    { order: 11, name: 'Pneumococcal (PCV13)', age: '4 months', dose: '2nd', description: 'Second dose of the pneumococcal conjugate vaccine.' },
    { order: 12, name: 'Polio (IPV)', age: '4 months', dose: '2nd', description: 'Second dose of the inactivated poliovirus vaccine.' },
];

async function initializeVaccinationsForUser(userId: string): Promise<Vaccination[]> {
    const batch = writeBatch(db);
    const vaccinations: Vaccination[] = [];

    defaultVaccinationSchedule.forEach(vaxData => {
        const docRef = doc(collection(db, 'vaccinations'));
        const newVax = {
            ...vaxData,
            id: docRef.id,
            userId,
            status: false,
            createdAt: serverTimestamp(),
        };
        batch.set(docRef, newVax);
        vaccinations.push({
            ...newVax,
            createdAt: new Date() // For immediate use
        } as Vaccination);
    });

    await batch.commit();
    return vaccinations.sort((a, b) => a.order - b.order);
}

export async function getVaccinations(userId: string): Promise<Vaccination[]> {
    const q = query(collection(db, 'vaccinations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return initializeVaccinationsForUser(userId);
    }

    const vaccinations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vaccination));
    return vaccinations.sort((a, b) => a.order - b.order);
}

export async function updateVaccinationStatus(userId: string, vaccinationId: string, status: boolean): Promise<void> {
    const docRef = doc(db, 'vaccinations', vaccinationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().userId !== userId) {
        throw new Error("Unauthorized or vaccination not found.");
    }
    
    await updateDoc(docRef, { status });
}

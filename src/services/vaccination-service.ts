// src/services/vaccination-service.ts
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

export interface Vaccine {
    id: string;
    name: string;
    age: string;
    dose: string;
    description: string;
    order: number;
}

export interface UserVaccinationStatus {
    userId: string;
    vaccineId: string;
    status: 0 | 1; // 0 for pending, 1 for completed
    imageUrl?: string;
}

export interface MergedVaccination extends Vaccine {
    status: 0 | 1;
    imageUrl?: string;
}

// This would ideally be a one-time seeding script.
// For now, we'll use it to ensure the vaccines collection is populated.
const defaultVaccinationSchedule: Omit<Vaccine, 'id'>[] = [
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

async function seedVaccines() {
    const vaccinesCol = collection(db, 'vaccines');
    const snapshot = await getDocs(vaccinesCol);
    if (snapshot.empty) {
        console.log('Vaccines collection is empty, seeding...');
        const batch = defaultVaccinationSchedule.map((vax, index) => {
            const id = `${vax.name.toLowerCase().replace(/[^a-z0-9]/g, '')}${vax.dose.charAt(0)}`;
            const vaxDocRef = doc(vaccinesCol, id);
            return setDoc(vaxDocRef, vax);
        });
        await Promise.all(batch);
        console.log('Finished seeding vaccines.');
    }
}


async function getAllVaccines(): Promise<Vaccine[]> {
    await seedVaccines(); // Ensure vaccines exist
    const vaccinesCol = collection(db, 'vaccines');
    const q = query(vaccinesCol, where('order', '>', 0)); // A simple query to fetch all
    const snapshot = await getDocs(q);
    const vaccines: Vaccine[] = [];
    snapshot.forEach(doc => {
        vaccines.push({ id: doc.id, ...doc.data() } as Vaccine);
    });
    return vaccines.sort((a, b) => a.order - b.order);
}

export async function getVaccinations(userId: string): Promise<MergedVaccination[]> {
    const allVaccines = await getAllVaccines();

    const userStatusCol = collection(db, 'userVaccinationStatus');
    const q = query(userStatusCol, where('userId', '==', userId));
    const statusSnapshot = await getDocs(q);

    const userStatuses = new Map<string, UserVaccinationStatus>();
    statusSnapshot.forEach(doc => {
        const data = doc.data() as UserVaccinationStatus;
        userStatuses.set(data.vaccineId, data);
    });

    const mergedVaccinations: MergedVaccination[] = allVaccines.map(vaccine => {
        const userStatus = userStatuses.get(vaccine.id);
        return {
            ...vaccine,
            status: userStatus?.status ?? 0,
            imageUrl: userStatus?.imageUrl,
        };
    });

    return mergedVaccinations;
}

export async function updateVaccinationStatus(userId: string, vaccineId: string, status: 0 | 1, imageUrl?: string): Promise<void> {
    const docId = `${userId}_${vaccineId}`;
    const statusDocRef = doc(db, 'userVaccinationStatus', docId);

    try {
        const docSnap = await getDoc(statusDocRef);
        const data: UserVaccinationStatus = {
            userId,
            vaccineId,
            status,
            imageUrl: imageUrl !== undefined ? imageUrl : (docSnap.exists() ? docSnap.data().imageUrl : undefined),
        };

        if (status === 0 && data.imageUrl) {
            delete data.imageUrl; // Remove image if marking as pending
        }

        await setDoc(statusDocRef, data, { merge: true });
    } catch(e) {
        console.error("Error updating vaccination status:", e);
        throw new Error("Could not update vaccination status.");
    }
}

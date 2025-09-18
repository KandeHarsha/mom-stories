// src/services/vaccination-service.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { getUserProfile, updateUserProfile as updateUserProfileInDb, type UserProfile } from './user-service';

export interface Vaccination {
    id: string;
    name: string;
    age: string;
    dose: string;
    status: boolean;
    description: string;
    order: number;
}

const defaultVaccinationSchedule: Omit<Vaccination, 'status'>[] = [
    { id: 'hepb1', order: 1, name: 'Hepatitis B (HepB)', age: 'Birth', dose: '1st', description: 'Protects against Hepatitis B, a liver disease that can be serious. The first shot is usually given within 24 hours of birth.' },
    { id: 'hepb2', order: 2, name: 'Hepatitis B (HepB)', age: '1-2 months', dose: '2nd', description: 'The second dose of the Hepatitis B vaccine series, continuing protection.' },
    { id: 'rv1', order: 3, name: 'Rotavirus (RV)', age: '2 months', dose: '1st', description: 'Protects against rotavirus, which causes severe diarrhea, vomiting, fever, and abdominal pain, mostly in babies and young children.' },
    { id: 'dtap1', order: 4, name: 'DTaP', age: '2 months', dose: '1st', description: 'Protects against Diphtheria, Tetanus, and Pertussis (whooping cough).' },
    { id: 'hib1', order: 5, name: 'Hib', age: '2 months', dose: '1st', description: 'Protects against Haemophilus influenzae type b, a type of bacteria that can cause serious illness, including meningitis and pneumonia.' },
    { id: 'pcv1', order: 6, name: 'Pneumococcal (PCV13)', age: '2 months', dose: '1st', description: 'Protects against pneumococcal disease, which can lead to ear infections, pneumonia, and meningitis.' },
    { id: 'ipv1', order: 7, name: 'Polio (IPV)', age: '2 months', dose: '1st', description: 'Protects against polio, a disabling and life-threatening disease caused by the poliovirus.' },
    { id: 'rv2', order: 8, name: 'Rotavirus (RV)', age: '4 months', dose: '2nd', description: 'Second dose to build immunity against rotavirus.' },
    { id: 'dtap2', order: 9, name: 'DTaP', age: '4 months', dose: '2nd', description: 'Second dose of the DTaP series.' },
    { id: 'hib2', order: 10, name: 'Hib', age: '4 months', dose: '2nd', description: 'Second dose of the Hib series.' },
    { id: 'pcv2', order: 11, name: 'Pneumococcal (PCV13)', age: '4 months', dose: '2nd', description: 'Second dose of the pneumococcal conjugate vaccine.' },
    { id: 'ipv2', order: 12, name: 'Polio (IPV)', age: '4 months', dose: '2nd', description: 'Second dose of the inactivated poliovirus vaccine.' },
];

async function initializeVaccinationsForUser(userId: string): Promise<Vaccination[]> {
    const vaccinations: Vaccination[] = defaultVaccinationSchedule.map(vax => ({
        ...vax,
        status: false,
    }));

    await updateUserProfileInDb(userId, { vaccinations });

    return vaccinations.sort((a, b) => a.order - b.order);
}

export async function getVaccinations(userId: string): Promise<Vaccination[]> {
    const userProfile = await getUserProfile(userId);

    if (userProfile && userProfile.vaccinations) {
        return userProfile.vaccinations.sort((a, b) => a.order - b.order);
    }
    
    // If profile exists but vaccinations don't, or if profile was just created.
    return initializeVaccinationsForUser(userId);
}

export async function updateVaccinationStatus(userId: string, vaccinationId: string, status: boolean): Promise<void> {
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.vaccinations) {
        throw new Error("User profile or vaccination schedule not found.");
    }

    const updatedVaccinations = userProfile.vaccinations.map(vax => 
        vax.id === vaccinationId ? { ...vax, status: status } : vax
    );

    await updateUserProfileInDb(userId, { vaccinations: updatedVaccinations });
}

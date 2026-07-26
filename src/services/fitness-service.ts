// src/services/fitness-service.ts
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';

export const DEFAULT_STEP_GOAL = 7000;
export const MIN_STEP_GOAL = 1000;
export const MAX_STEP_GOAL = 100000;

export interface FitnessDataPoint {
    date: string; // 'YYYY-MM-DD'
    steps: number;
    stairsClimbed: number;
    caloriesBurned: number;
}

interface FitnessDataDoc extends FitnessDataPoint {
    userId: string;
}

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidFitnessDataPoint(point: any): point is FitnessDataPoint {
    return (
        point &&
        typeof point.date === 'string' &&
        DATE_KEY_REGEX.test(point.date) &&
        typeof point.steps === 'number' && point.steps >= 0 &&
        typeof point.stairsClimbed === 'number' && point.stairsClimbed >= 0 &&
        typeof point.caloriesBurned === 'number' && point.caloriesBurned >= 0
    );
}

export async function upsertFitnessData(userId: string, points: FitnessDataPoint[]): Promise<void> {
    await Promise.all(points.map(point => {
        const docId = `${userId}_${point.date}`;
        const docRef = doc(db, 'fitnessData', docId);
        const data: FitnessDataDoc = {
            userId,
            date: point.date,
            steps: point.steps,
            stairsClimbed: point.stairsClimbed,
            caloriesBurned: point.caloriesBurned,
        };
        return setDoc(docRef, data, { merge: true });
    }));
}

export async function getFitnessHistory(userId: string, days: number): Promise<FitnessDataPoint[]> {
    const fitnessCol = collection(db, 'fitnessData');
    const q = query(
        fitnessCol,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(days),
    );
    const snapshot = await getDocs(q);

    const points: FitnessDataPoint[] = [];
    snapshot.forEach(docSnap => {
        const data = docSnap.data() as FitnessDataDoc;
        points.push({
            date: data.date,
            steps: data.steps,
            stairsClimbed: data.stairsClimbed,
            caloriesBurned: data.caloriesBurned,
        });
    });

    // Return oldest → newest to match the mobile client's expected ordering.
    return points.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getStepGoal(userId: string): Promise<number> {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    const stepGoal = docSnap.exists() ? docSnap.data().stepGoal : undefined;
    return typeof stepGoal === 'number' && stepGoal > 0 ? stepGoal : DEFAULT_STEP_GOAL;
}

export async function setStepGoal(userId: string, stepGoal: number): Promise<void> {
    const docRef = doc(db, 'userProfiles', userId);
    await setDoc(docRef, { stepGoal }, { merge: true });
}

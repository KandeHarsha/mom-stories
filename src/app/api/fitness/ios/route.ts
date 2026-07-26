// src/app/api/fitness/ios/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    getFitnessHistory,
    getStepGoal,
    isValidFitnessDataPoint,
    MAX_STEP_GOAL,
    MIN_STEP_GOAL,
    setStepGoal,
    upsertFitnessData,
} from '@/services/fitness-service';

const DEFAULT_DAYS = 7;
const MAX_DAYS = 31;

// GET /api/fitness/ios?days=7 — fetch fitness history and step goal for the authenticated user (iOS/HealthKit only)
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;

        const { searchParams } = new URL(request.url);
        const daysParam = Number(searchParams.get('days'));
        const days = Number.isInteger(daysParam) && daysParam > 0
            ? Math.min(daysParam, MAX_DAYS)
            : DEFAULT_DAYS;

        const [data, stepGoal] = await Promise.all([
            getFitnessHistory(userId, days),
            getStepGoal(userId),
        ]);

        return NextResponse.json({ data, stepGoal }, { status: 200 });
    } catch (error) {
        console.error('Get Fitness History Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to fetch fitness history.', details: errorMessage }, { status: 500 });
    }
}

// POST /api/fitness/ios — sync HealthKit fitness data points for the authenticated user (iOS only)
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { data } = body;

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ error: 'data must be a non-empty array of fitness data points.' }, { status: 400 });
        }

        if (!data.every(isValidFitnessDataPoint)) {
            return NextResponse.json({
                error: 'Each fitness data point must have a date (YYYY-MM-DD) and non-negative steps, stairsClimbed, and caloriesBurned.',
            }, { status: 400 });
        }

        await upsertFitnessData(userId, data);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Sync Fitness Data Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to sync fitness data.', details: errorMessage }, { status: 500 });
    }
}

// PUT /api/fitness/ios — update the authenticated user's daily step goal
export async function PUT(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { stepGoal } = body;

        if (
            typeof stepGoal !== 'number' ||
            !Number.isInteger(stepGoal) ||
            stepGoal < MIN_STEP_GOAL ||
            stepGoal > MAX_STEP_GOAL
        ) {
            return NextResponse.json({
                error: `stepGoal must be an integer between ${MIN_STEP_GOAL} and ${MAX_STEP_GOAL}.`,
            }, { status: 400 });
        }

        await setStepGoal(userId, stepGoal);

        return NextResponse.json({ success: true, stepGoal }, { status: 200 });
    } catch (error) {
        console.error('Update Step Goal Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to update step goal.', details: errorMessage }, { status: 500 });
    }
}

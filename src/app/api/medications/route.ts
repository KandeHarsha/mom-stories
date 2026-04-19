// src/app/api/medications/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addMedication, getMedications, isValidMedicationType, VALID_MEDICATION_TYPES, isValidFrequency, VALID_FREQUENCIES } from '@/services/medication-service';

// GET: List all medications for the authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const medications = await getMedications(userId);

        return NextResponse.json(medications, { status: 200 });
    } catch (error) {
        console.error('Get Medications Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            error: 'Failed to retrieve medications.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

// POST: Create a new medication
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

        const { title, frequency, dosage, type, reminderTime, weekday, notificationId } = body;

        // Validate required fields
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
        }

        // Validate frequency if provided
        if (frequency !== undefined && !isValidFrequency(frequency)) {
            return NextResponse.json({
                error: `Invalid frequency. Must be one of: ${VALID_FREQUENCIES.join(', ')}`,
            }, { status: 400 });
        }

        // Validate type if provided
        if (type !== undefined && !isValidMedicationType(type)) {
            return NextResponse.json({ 
                error: `Invalid medication type. Must be one of: ${VALID_MEDICATION_TYPES.join(', ')}` 
            }, { status: 400 });
        }

        // Validate reminderTime if provided
        if (reminderTime !== undefined) {
            const { hour, minute } = reminderTime ?? {};
            if (
                typeof hour !== 'number' || !Number.isInteger(hour) || hour < 0 || hour > 23 ||
                typeof minute !== 'number' || !Number.isInteger(minute) || minute < 0 || minute > 59
            ) {
                return NextResponse.json({
                    error: 'Invalid reminderTime. hour must be 0–23 and minute must be 0–59.',
                }, { status: 400 });
            }
        }

        // Validate weekday if provided
        if (weekday !== undefined) {
            if (typeof weekday !== 'number' || !Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
                return NextResponse.json({
                    error: 'Invalid weekday. Must be an integer 1 (Sun) - 7 (Sat).',
                }, { status: 400 });
            }
        }

        // Validate notificationId if provided
        if (notificationId !== undefined && (typeof notificationId !== 'string' || notificationId.trim() === '')) {
            return NextResponse.json({ error: 'notificationId must be a non-empty string.' }, { status: 400 });
        }

        const medicationData = {
            userId,
            title: title.trim(),
            ...(frequency && { frequency }),
            ...(dosage && { dosage }),
            ...(type && { type }),
            ...(reminderTime !== undefined && { reminderTime }),
            ...(weekday !== undefined && { weekday }),
            ...(notificationId && { notificationId }),
        };

        const id = await addMedication(medicationData);

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Create Medication Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            error: 'Failed to create medication.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

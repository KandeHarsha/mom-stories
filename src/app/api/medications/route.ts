// src/app/api/medications/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addMedication, getMedications, isValidMedicationType, VALID_MEDICATION_TYPES } from '@/services/medication-service';

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

        const { title, frequency, dosage, type } = body;

        // Validate required fields
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
        }

        // Validate type if provided
        if (type !== undefined && !isValidMedicationType(type)) {
            return NextResponse.json({ 
                error: `Invalid medication type. Must be one of: ${VALID_MEDICATION_TYPES.join(', ')}` 
            }, { status: 400 });
        }

        const medicationData = {
            userId,
            title: title.trim(),
            ...(frequency && { frequency }),
            ...(dosage && { dosage }),
            ...(type && { type }),
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

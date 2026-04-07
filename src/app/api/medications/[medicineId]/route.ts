// src/app/api/medications/[medicineId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMedicationById, updateMedication, deleteMedication, isValidMedicationType, VALID_MEDICATION_TYPES } from '@/services/medication-service';

// GET: Retrieve a single medication by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ medicineId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const { medicineId } = await params;

        if (!medicineId) {
            return NextResponse.json({ error: 'Medication ID is required.' }, { status: 400 });
        }

        const medication = await getMedicationById(medicineId, userId);

        if (!medication) {
            return NextResponse.json({ error: 'Medication not found.' }, { status: 404 });
        }

        return NextResponse.json(medication, { status: 200 });
    } catch (error) {
        console.error('Get Medication Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        if (errorMessage === 'Unauthorized access to medication.') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to retrieve medication.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

// PUT: Update a medication by ID
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ medicineId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const { medicineId } = await params;

        if (!medicineId) {
            return NextResponse.json({ error: 'Medication ID is required.' }, { status: 400 });
        }

        const body = await request.json();
        const { title, frequency, dosage, type } = body;

        // Validate type if provided
        if (type !== undefined && !isValidMedicationType(type)) {
            return NextResponse.json({ 
                error: `Invalid medication type. Must be one of: ${VALID_MEDICATION_TYPES.join(', ')}` 
            }, { status: 400 });
        }

        // Validate title if provided (cannot be empty string)
        if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
            return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 });
        }

        const updateData: Record<string, string> = {};
        if (title !== undefined) updateData.title = title.trim();
        if (frequency !== undefined) updateData.frequency = frequency;
        if (dosage !== undefined) updateData.dosage = dosage;
        if (type !== undefined) updateData.type = type;

        await updateMedication(medicineId, userId, updateData);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Update Medication Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        if (errorMessage === 'Unauthorized or medication not found.') {
            return NextResponse.json({ error: 'Medication not found or unauthorized.' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to update medication.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

// DELETE: Delete a medication by ID
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ medicineId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const { medicineId } = await params;

        if (!medicineId) {
            return NextResponse.json({ error: 'Medication ID is required.' }, { status: 400 });
        }

        await deleteMedication(medicineId, userId);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Delete Medication Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        if (errorMessage === 'Unauthorized or medication not found.') {
            return NextResponse.json({ error: 'Medication not found or unauthorized.' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to delete medication.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

// src/app/api/children/[childId]/measurements/route.ts
import { NextResponse } from 'next/server';
import { addMeasurement } from '@/services/child-service';
import { auth } from '@/lib/auth';
import { getChildProfile } from '@/services/child-service';

// Add a new measurement
export async function POST(request: Request, { params }: { params: { childId: string } }) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        let childId = params.childId;

        if (!childId) {
            return new NextResponse(JSON.stringify({ error: 'Child ID is required.' }), { status: 400 });
        }
        
        // Security check: ensure the user is the parent of the child
        const childProfile = await getChildProfile(childId);
        if (!childProfile || childProfile.parentId !== userId) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        const data = await request.json();
        const { weight, height, date } = data;

        if (!weight && !height) {
            return new NextResponse(JSON.stringify({ error: 'At least one measurement (weight or height) is required.' }), { status: 400 });
        }
        
        if (!date) {
             return new NextResponse(JSON.stringify({ error: 'Date is required.' }), { status: 400 });
        }
        
        const newMeasurement = {
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseFloat(height) : undefined,
            date: new Date(date),
        };

        await addMeasurement(childId, newMeasurement);
        
        const updatedProfile = await getChildProfile(childId);

        return new NextResponse(JSON.stringify({ success: true, profile: updatedProfile }), { status: 200 });

    } catch (error) {
        console.error('Add Measurement Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to add measurement.', details: errorMessage }), { status: 500 });
    }
}

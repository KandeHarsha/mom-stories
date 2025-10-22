// src/app/api/babies/[babyId]/measurements/route.ts
import { NextResponse } from 'next/server';
import { addMeasurement } from '@/services/baby-service';
import { getUserProfile } from '@/services/auth-service';
import { getBabyProfile } from '@/services/baby-service';

// Add a new measurement
export async function POST(request: Request, { params }: { params: { babyId: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userProfileResponse = await getUserProfile(token);
        if (!userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }

        const babyId = params.babyId;
        if (!babyId) {
            return new NextResponse(JSON.stringify({ error: 'Baby ID is required.' }), { status: 400 });
        }
        
        // Security check: ensure the user is the parent of the baby
        const babyProfile = await getBabyProfile(babyId);
        if (babyProfile?.parentId !== userProfileResponse.Uid) {
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

        await addMeasurement(babyId, newMeasurement);
        
        const updatedProfile = await getBabyProfile(babyId);

        return new NextResponse(JSON.stringify({ success: true, profile: updatedProfile }), { status: 200 });

    } catch (error) {
        console.error('Add Measurement Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to add measurement.', details: errorMessage }), { status: 500 });
    }
}

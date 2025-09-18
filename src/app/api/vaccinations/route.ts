// src/app/api/vaccinations/route.ts
import { NextResponse } from 'next/server';
import { getVaccinations } from '@/services/vaccination-service';
import { getUserProfile } from '@/services/auth-service';

// Get all vaccinations for a user
export async function GET(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        
        const userProfileResponse = await getUserProfile(token);
        if (!userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }
        
        const vaccinations = await getVaccinations(userProfileResponse.Uid);
        return NextResponse.json(vaccinations, { status: 200 });

    } catch (error) {
        console.error('Get Vaccinations Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch vaccinations.', details: errorMessage }), { status: 500 });
    }
}

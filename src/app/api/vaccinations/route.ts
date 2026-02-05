// src/app/api/vaccinations/route.ts
import { NextResponse } from 'next/server';
import { getVaccinations } from '@/services/vaccination-service';
import { getUserProfile } from '@/services/auth-service';
import { auth } from '@/lib/auth';

// Get all vaccinations for a user
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }


        const userId = session.user.id
        
        const vaccinations = await getVaccinations(userId);
        return NextResponse.json(vaccinations, { status: 200 });

    } catch (error) {
        console.error('Get Vaccinations Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch vaccinations.', details: errorMessage }), { status: 500 });
    }
}

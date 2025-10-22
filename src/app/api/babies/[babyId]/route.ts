import { NextResponse } from 'next/server';
import { getUserProfile } from '@/services/auth-service';
import { getBabyProfile } from '@/services/baby-service';

// Get baby profile by babyId
export async function GET(request: Request, { params }: { params: { babyId: string } }) {
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
        if (!babyProfile || babyProfile.parentId !== userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        return new NextResponse(JSON.stringify({ success: true, profile: babyProfile }), { status: 200 });
    } catch (error) {
        console.error('Get Baby Profile Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch baby profile.', details: errorMessage }), { status: 500 });
    }
}

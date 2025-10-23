import { NextResponse } from 'next/server';
import { getUserProfile } from '@/services/auth-service';
import { getChildProfile } from '@/services/child-service';

// Get child profile by childId
export async function GET(request: Request, { params }: { params: { childId: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userProfileResponse = await getUserProfile(token);
        if (!userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }

        const childId = params.childId;
        if (!childId) {
            return new NextResponse(JSON.stringify({ error: 'Child ID is required.' }), { status: 400 });
        }

        // Security check: ensure the user is the parent of the child
        const childProfile = await getChildProfile(childId);
        if (!childProfile || childProfile.parentId !== userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        return new NextResponse(JSON.stringify({ success: true, profile: childProfile }), { status: 200 });
    } catch (error) {
        console.error('Get Child Profile Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch child profile.', details: errorMessage }), { status: 500 });
    }
}

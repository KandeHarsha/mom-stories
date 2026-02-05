import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getChildProfile } from '@/services/child-service';

// Get child profile by childId
export async function GET(request: Request, { params }: { params: { childId: string } }) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        let childId = params.childId;

        // If childId is "first", get the first child from user's childrenIds array
        if (childId === "first") {
            const childrenIds = (session.user.childrenIds as string[]) || [];
            if (childrenIds.length === 0) {
                return new NextResponse(JSON.stringify({ error: 'No children found for this user.' }), { status: 404 });
            }
            childId = childrenIds[0];
        }

        if (!childId) {
            return new NextResponse(JSON.stringify({ error: 'Child ID is required.' }), { status: 400 });
        }

        // Security check: ensure the user is the parent of the child
        const childProfile = await getChildProfile(childId);
        if (!childProfile || childProfile.parentId !== userId) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        return new NextResponse(JSON.stringify({ success: true, profile: childProfile }), { status: 200 });
    } catch (error) {
        console.error('Get Child Profile Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch child profile.', details: errorMessage }), { status: 500 });
    }
}

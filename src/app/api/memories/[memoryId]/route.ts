// src/app/api/memories/[memoryId]/route.ts
import { NextResponse } from 'next/server';
import { deleteMemory } from '@/services/memory-service';
import { getUserProfile } from '@/services/auth-service';

// Delete a memory
export async function DELETE(request: Request, { params }: { params: { memoryId: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userProfileResponse = await getUserProfile(token);
        if (!userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }

        const memoryId = params.memoryId;
        if (!memoryId) {
            return new NextResponse(JSON.stringify({ error: 'Memory ID is required.' }), { status: 400 });
        }

        // Pass UID to ensure user can only delete their own memory.
        await deleteMemory(memoryId, userProfileResponse.Uid);

        return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Delete Memory Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to delete memory.', details: errorMessage }), { status: 500 });
    }
}

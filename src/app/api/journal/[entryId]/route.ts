// src/app/api/journal/[entryId]/route.ts
import { NextResponse } from 'next/server';
import { updateJournalEntry, deleteJournalEntry } from '@/services/journal-service';
import { validateAccessToken } from '@/services/auth-service';

// Update an entry
export async function PUT(request: Request, { params }: { params: { entryId: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const validationResponse = await validateAccessToken(token);
        if (!validationResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }
        
        const entryId = params.entryId;
        if (!entryId) {
            return new NextResponse(JSON.stringify({ error: 'Entry ID is required.' }), { status: 400 });
        }
        
        const data = await request.json();

        // Pass UID to ensure user can only update their own entry. This logic would be inside updateJournalEntry.
        await updateJournalEntry(entryId, validationResponse.Uid, {
            title: data.title,
            content: data.content,
        });

        return new NextResponse(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Update Journal Entry Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to update journal entry.', details: errorMessage }), { status: 500 });
    }
}


// Delete an entry
export async function DELETE(request: Request, { params }: { params: { entryId: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const validationResponse = await validateAccessToken(token);
        if (!validationResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }

        const entryId = params.entryId;
        if (!entryId) {
            return new NextResponse(JSON.stringify({ error: 'Entry ID is required.' }), { status: 400 });
        }

        // Pass UID to ensure user can only delete their own entry.
        await deleteJournalEntry(entryId, validationResponse.Uid);

        return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Delete Journal Entry Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to delete journal entry.', details: errorMessage }), { status: 500 });
    }
}

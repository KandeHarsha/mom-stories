// src/app/api/journal/[entryId]/route.ts
import { NextResponse } from 'next/server';
import { updateJournalEntry, deleteJournalEntry } from '@/services/journal-service';

// To get the user ID in a real app, you would use an authentication check.
const DUMMY_USER_ID = 'dummy-user-id'; 

// Update an entry
export async function PUT(request: Request, { params }: { params: { entryId: string } }) {
    try {
        const entryId = params.entryId;
        if (!entryId) {
            return new NextResponse(JSON.stringify({ error: 'Entry ID is required.' }), { status: 400 });
        }
        
        const data = await request.json();

        await updateJournalEntry(entryId, {
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
        const entryId = params.entryId;
        if (!entryId) {
            return new NextResponse(JSON.stringify({ error: 'Entry ID is required.' }), { status: 400 });
        }

        await deleteJournalEntry(entryId);

        return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Delete Journal Entry Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to delete journal entry.', details: errorMessage }), { status: 500 });
    }
}

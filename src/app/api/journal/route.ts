// src/app/api/journal/route.ts
import { NextResponse } from 'next/server';
import { getJournalEntries, addJournalEntry, uploadFileAndGetURL } from '@/services/journal-service';

// To get the user ID in a real app, you would use an authentication check.
const DUMMY_USER_ID = 'dummy-user-id'; 

// Get all entries
export async function GET(request: Request) {
    try {
        const entries = await getJournalEntries(DUMMY_USER_ID);
        return new NextResponse(JSON.stringify(entries), { status: 200 });
    } catch (error) {
        console.error('Get Journal Entries Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch journal entries.', details: errorMessage }), { status: 500 });
    }
}

// Create a new entry
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const imageFile = formData.get('picture') as File | null;
        const voiceNoteFile = formData.get('voiceNote') as File | null;
        
        if(!title || !content) {
             return new NextResponse(JSON.stringify({ error: 'Title and content are required.' }), { status: 400 });
        }

        const dataToSave: {
            title: string;
            content: string;
            userId: string;
            imageUrl?: string;
            voiceNoteUrl?: string;
        } = {
            title,
            content,
            userId: DUMMY_USER_ID,
        };

        if (imageFile && imageFile.size > 0) {
             dataToSave.imageUrl = await uploadFileAndGetURL(imageFile, DUMMY_USER_ID, 'journal-images');
        }

        if (voiceNoteFile && voiceNoteFile.size > 0) {
            const voiceNoteBuffer = await voiceNoteFile.arrayBuffer();
            dataToSave.voiceNoteUrl = await uploadFileAndGetURL(voiceNoteBuffer, DUMMY_USER_ID, 'journal-voice-notes');
        }
        
        const newEntryId = await addJournalEntry(dataToSave);

        return new NextResponse(JSON.stringify({ success: true, id: newEntryId }), { status: 201 });

    } catch (error) {
        console.error('Create Journal Entry Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to save journal entry.', details: errorMessage }), { status: 500 });
    }
}

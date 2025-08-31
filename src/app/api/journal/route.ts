// src/app/api/journal/route.ts
import { NextResponse } from 'next/server';
import { getJournalEntries, addJournalEntry, uploadFileAndGetURL } from '@/services/journal-service';

// Get all entries
export async function GET(request: Request) {
    try {
        // In a real app, you would get the userId from the user's session
        const userId = 'DUMMY_USER_ID'; 
        const entries = await getJournalEntries(userId);
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
        const userId = 'DUMMY_USER_ID'; // Replace with actual user ID from session
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
            userId: userId,
        };

        if (imageFile && imageFile.size > 0) {
             dataToSave.imageUrl = await uploadFileAndGetURL(imageFile, userId, 'journal-images');
        }

        if (voiceNoteFile && voiceNoteFile.size > 0) {
            const voiceNoteBuffer = await voiceNoteFile.arrayBuffer();
            dataToSave.voiceNoteUrl = await uploadFileAndGetURL(voiceNoteBuffer, userId, 'journal-voice-notes');
        }
        
        const newEntryId = await addJournalEntry(dataToSave);

        return new NextResponse(JSON.stringify({ success: true, id: newEntryId }), { status: 201 });

    } catch (error) {
        console.error('Create Journal Entry Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to save journal entry.', details: errorMessage }), { status: 500 });
    }
}

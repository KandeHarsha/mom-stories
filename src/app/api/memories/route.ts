
// src/app/api/memories/route.ts
import { NextResponse } from 'next/server';
import { getMemories, addMemory } from '@/services/memory-service';
import { uploadFileAndGetURL } from '@/services/journal-service';
import { getUserProfile } from '@/services/auth-service';

// Get all memories
export async function GET(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        
        const userProfileResponse = await getUserProfile(token);
        const { searchParams } = new URL(request.url);
        const isAiResponse = searchParams.get('isAiResponse');

        const memories = await getMemories(userProfileResponse.Uid, isAiResponse ? isAiResponse === 'true' : undefined);
        return new NextResponse(JSON.stringify(memories), { status: 200 });
    } catch (error) {
        console.error('Get Memories Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch memories.', details: errorMessage }), { status: 500 });
    }
}

// Create a new memory
export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userProfileResponse = await getUserProfile(token);
        const userId = userProfileResponse.Uid;

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const text = formData.get('text') as string | null;
        const imageFile = formData.get('image') as File | null;
        const voiceNoteFile = formData.get('voiceNote') as File | null;
        const isAiResponse = formData.get('isAiResponse') === 'true';
        
        if(!title) {
             return new NextResponse(JSON.stringify({ error: 'Title is required.' }), { status: 400 });
        }

        const dataToSave: {
            title: string;
            text?: string;
            userId: string;
            imageUrl?: string;
            voiceNoteUrl?: string;
            isAiResponse: boolean;
        } = {
            title,
            text: text || '',
            userId: userId,
            isAiResponse: isAiResponse,
        };

        if (imageFile && imageFile.size > 0) {
             dataToSave.imageUrl = await uploadFileAndGetURL(imageFile, userId, 'memories-images');
        }

        if (voiceNoteFile && voiceNoteFile.size > 0) {
            dataToSave.voiceNoteUrl = await uploadFileAndGetURL(voiceNoteFile, userId, 'memories-voice-notes');
        }
        
        const newMemoryId = await addMemory(dataToSave);

        return new NextResponse(JSON.stringify({ success: true, id: newMemoryId }), { status: 201 });

    } catch (error) {
        console.error('Create Memory Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to save memory.', details: errorMessage }), { status: 500 });
    }
}

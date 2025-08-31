// src/app/actions.ts
'use server';

import { aiPoweredSupport } from '@/ai/flows/ai-powered-support';
import { generateJournalingPrompt } from '@/ai/flows/personalized-journaling-prompts';
import { saveJournalEntry } from '@/ai/flows/save-journal-entry';
import { updateJournalEntry } from '@/ai/flows/update-journal-entry';
import { deleteJournalEntry } from '@/ai/flows/delete-journal-entry';
import { uploadFileAndGetURL, getJournalEntries } from '@/services/journal-service';
import { z } from 'zod';
import { saveMemory } from '@/ai/flows/save-memory';
import { deleteMemory } from '@/ai/flows/delete-memory';
import { getMemories } from '@/ai/flows/get-memories';
import { type Memory } from '@/services/memory-service';

const promptSchema = z.object({
  stageOfMotherhood: z.string().min(1, 'Stage of motherhood is required.'),
  recentExperiences: z.string().min(1, 'Recent experiences are required.'),
});

export async function getJournalingPrompt(formData: FormData) {
  const rawData = {
    stageOfMotherhood: formData.get('stageOfMotherhood'),
    recentExperiences: formData.get('recentExperiences'),
  };
  
  const validatedInput = promptSchema.safeParse(rawData);
  
  if (!validatedInput.success) {
    return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }
  
  try {
    const result = await generateJournalingPrompt(validatedInput.data);
    return { prompt: result.prompt };
  } catch (e) {
    return { error: 'Failed to generate prompt. Please try again later.' };
  }
}

const supportSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
});

export async function getSupportAnswer(formData: FormData) {
  const rawData = {
    question: formData.get('question'),
  };

  const validatedInput = supportSchema.safeParse(rawData);

  if (!validatedInput.success) {
      return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }
  
  try {
      const result = await aiPoweredSupport(validatedInput.data);
      return { answer: result.answer };
  } catch (e) {
      return { error: 'Failed to get an answer. Please try again later.' };
  }
}

export async function saveJournalEntryAction(formData: FormData) {
    const userId = 'DUMMY_USER_ID'; // Replace with actual user ID from session
    const dataToSave: {
        title: string;
        content: string;
        userId: string;
        imageUrl?: string;
        voiceNoteUrl?: string;
    } = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        userId: userId,
    };

    const imageFile = formData.get('picture') as File | null;
    if (imageFile && imageFile.size > 0 && imageFile.name) {
        try {
            dataToSave.imageUrl = await uploadFileAndGetURL(imageFile, userId, 'journal-images');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error("Upload error in action:", errorMessage);
            return { error: 'Failed to upload image. Please try again later.' };
        }
    }

    const voiceNoteFile = formData.get('voiceNote') as File | null;
    if (voiceNoteFile && voiceNoteFile.size > 0) {
        try {
            const voiceNoteBuffer = await voiceNoteFile.arrayBuffer();
            dataToSave.voiceNoteUrl = await uploadFileAndGetURL(voiceNoteBuffer, userId, 'journal-voice-notes');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error("Voice note upload error in action:", errorMessage);
            return { error: 'Failed to upload voice note. Please try again later.' };
        }
    }

    try {
        await saveJournalEntry(dataToSave);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Save error in action:", errorMessage);
        return { error: 'Failed to save journal entry. Please try again later.' };
    }
}

export async function getJournalEntriesAction() {
    // In a real app, you would get the userId from the user's session
    const userId = 'DUMMY_USER_ID'; 
    return await getJournalEntries(userId);
}

export async function updateJournalEntryAction(entryId: string, formData: FormData) {
    const dataToUpdate: {
        title: string;
        content: string;
    } = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
    };
    
    try {
        await updateJournalEntry(entryId, dataToUpdate);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Update error in action:", errorMessage);
        return { error: 'Failed to update journal entry. Please try again later.' };
    }
}


export async function deleteJournalEntryAction(entryId: string) {
    if (!entryId) {
        return { error: 'Entry ID is required.' };
    }
    try {
        await deleteJournalEntry(entryId);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Delete error in action:", errorMessage);
        return { error: 'Failed to delete journal entry. Please try again later.' };
    }
}

// Memory Box Actions
export async function saveMemoryAction(formData: FormData) {
    const userId = 'DUMMY_USER_ID'; // Replace with actual user ID from session
    const dataToSave: {
        title: string;
        text?: string;
        userId: string;
        imageUrl?: string;
        voiceNoteUrl?: string;
    } = {
        title: formData.get('title') as string,
        text: formData.get('text') as string,
        userId: userId,
    };

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
        try {
            dataToSave.imageUrl = await uploadFileAndGetURL(imageFile, userId, 'memories-images');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            return { error: `Failed to upload image: ${errorMessage}` };
        }
    }

    const voiceNoteFile = formData.get('voiceNote') as File | null;
    if (voiceNoteFile && voiceNoteFile.size > 0) {
        try {
            const voiceNoteBuffer = await voiceNoteFile.arrayBuffer();
            dataToSave.voiceNoteUrl = await uploadFileAndGetURL(voiceNoteBuffer, userId, 'memories-voice-notes');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            return { error: `Failed to upload voice note: ${errorMessage}` };
        }
    }

    try {
        await saveMemory(dataToSave);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { error: `Failed to save memory: ${errorMessage}` };
    }
}

export async function getMemoriesAction(): Promise<Memory[]> {
    const userId = 'DUMMY_USER_ID'; // Replace with actual user ID from session
    return await getMemories(userId);
}

export async function deleteMemoryAction(memoryId: string) {
    if (!memoryId) {
        return { error: 'Memory ID is required.' };
    }
    try {
        await deleteMemory(memoryId);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { error: `Failed to delete memory: ${errorMessage}` };
    }
}


// src/app/actions.ts
'use server';

import { aiPoweredSupport } from '@/ai/flows/ai-powered-support';
import { generateJournalingPrompt } from '@/ai/flows/personalized-journaling-prompts';
import { saveJournalEntry } from '@/ai/flows/save-journal-entry';
import { uploadFileAndGetURL, type JournalEntryData } from '@/services/journal-service';
import { getUserProfile, updateUserProfile } from '@/services/user-service';
import { z } from 'zod';

const DUMMY_USER_ID = 'dummy-user-id'; // Use a consistent dummy user ID

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

const journalEntrySchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    content: z.string().min(1, 'Content is required.'),
    userId: z.string(),
    imageUrl: z.string().optional(),
    voiceNoteUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export async function saveJournalEntryAction(formData: FormData) {
    
    const dataToSave: Omit<JournalEntryData, 'createdAt'> = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        userId: DUMMY_USER_ID,
    };

    const imageFile = formData.get('picture') as File | null;
    if (imageFile && imageFile.size > 0) {
        try {
            const imageBuffer = await imageFile.arrayBuffer();
            dataToSave.imageUrl = await uploadFileAndGetURL(imageBuffer, imageFile.name, DUMMY_USER_ID, 'journal-images');
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
            dataToSave.voiceNoteUrl = await uploadFileAndGetURL(voiceNoteBuffer, voiceNoteFile.name, DUMMY_USER_ID, 'journal-voice-notes');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error("Voice note upload error in action:", errorMessage);
            return { error: 'Failed to upload voice note. Please try again later.' };
        }
    }

    const validatedInput = journalEntrySchema.safeParse(dataToSave);

    if (!validatedInput.success) {
        return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await saveJournalEntry(validatedInput.data);
        return { success: true };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Save error in action:", errorMessage);
        return { error: 'Failed to save journal entry. Please try again later.' };
    }
}

export async function getUserProfileAction() {
    try {
        const profile = await getUserProfile(DUMMY_USER_ID);
        return profile;
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Get profile error in action:", errorMessage);
        return { error: 'Failed to get user profile.' };
    }
}

const phaseSchema = z.string().min(1, 'Phase cannot be empty');

export async function updateUserPhaseAction(phase: string) {
    const validatedPhase = phaseSchema.safeParse(phase);
     if (!validatedPhase.success) {
        return { error: validatedPhase.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await updateUserProfile(DUMMY_USER_ID, { phase: validatedPhase.data as any });
        return { success: true };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Update profile error in action:", errorMessage);
        return { error: 'Failed to update profile.' };
    }
}

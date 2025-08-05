
// src/app/actions.ts
'use server';

import { aiPoweredSupport } from '@/ai/flows/ai-powered-support';
import { generateJournalingPrompt } from '@/ai/flows/personalized-journaling-prompts';
import { saveJournalEntry } from '@/ai/flows/save-journal-entry';
import { uploadFileAndGetURL } from '@/services/journal-service';
import { z } from 'zod';

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
    const DUMMY_USER_ID = 'dummy-user-id';
    
    let imageUrl: string | undefined = undefined;
    const imageFile = formData.get('picture') as File;
    if (imageFile && imageFile.size > 0) {
        try {
            const imageBuffer = await imageFile.arrayBuffer();
            imageUrl = await uploadFileAndGetURL(imageBuffer, imageFile.name, DUMMY_USER_ID, 'journal-images');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error("Upload error in action:", errorMessage);
            return { error: 'Failed to upload image. Please try again later.' };
        }
    }

    let voiceNoteUrl: string | undefined = undefined;
    const voiceNoteFile = formData.get('voiceNote') as File;
    if (voiceNoteFile && voiceNoteFile.size > 0) {
        try {
            const voiceNoteBuffer = await voiceNoteFile.arrayBuffer();
            voiceNoteUrl = await uploadFileAndGetURL(voiceNoteBuffer, voiceNoteFile.name, DUMMY_USER_ID, 'journal-voice-notes');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error("Voice note upload error in action:", errorMessage);
            return { error: 'Failed to upload voice note. Please try again later.' };
        }
    }

    const rawData = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        userId: DUMMY_USER_ID,
        imageUrl,
        voiceNoteUrl,
    };

    const validatedInput = journalEntrySchema.safeParse(rawData);

    if (!validatedInput.success) {
        return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
    }

    try {
        await saveJournalEntry(validatedInput.data);
        return { success: true };
    } catch (e) {
        return { error: 'Failed to save journal entry. Please try again later.' };
    }
}

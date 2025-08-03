
// src/app/actions.ts
'use server';

import { aiPoweredSupport } from '@/ai/flows/ai-powered-support';
import { generateJournalingPrompt } from '@/ai/flows/personalized-journaling-prompts';
import { saveJournalEntry } from '@/ai/flows/save-journal-entry';
import { signInUser } from '@/ai/flows/sign-in-user';
import { signUpUser } from '@/ai/flows/sign-up-user';
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
    tags: z.array(z.string()).optional(),
});

export async function saveJournalEntryAction(formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        content: formData.get('content'),
        // Using a dummy user ID for now, as requested.
        userId: 'dummy-user-id',
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

const authSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function signUpUserAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedInput = authSchema.safeParse(rawData);

  if (!validatedInput.success) {
    return { error: validatedInput.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const result = await signUpUser(validatedInput.data);
    return { uid: result.uid };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function signInUserAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedInput = authSchema.safeParse(rawData);

  if (!validatedInput.success) {
    return { error: validatedInput.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const result = await signInUser(validatedInput.data);
    return { uid: result.uid };
  } catch (e: any) {
    return { error: e.message };
  }
}

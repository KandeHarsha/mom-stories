// src/app/actions.ts
'use server';

import { aiPoweredSupport } from '@/ai/flows/ai-powered-support';
import { generateJournalingPrompt } from '@/ai/flows/personalized-journaling-prompts';
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

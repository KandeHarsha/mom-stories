'use server';
/**
 * @fileOverview Saves a memory to the database.
 * 
 * - saveMemory - A function that handles saving a memory.
 * - SaveMemoryInput - The input type for the saveMemory function.
 */

import { addMemory } from '@/services/memory-service';
import { z } from 'zod';

const SaveMemoryInputSchema = z.object({
  userId: z.string(),
  title: z.string(),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  voiceNoteUrl: z.string().optional(),
});

export type SaveMemoryInput = z.infer<typeof SaveMemoryInputSchema>;

export async function saveMemory(input: SaveMemoryInput): Promise<void> {
    await addMemory(input);
}

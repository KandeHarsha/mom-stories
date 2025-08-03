'use server';
/**
 * @fileOverview Saves a journal entry to the database.
 * 
 * - saveJournalEntry - A function that handles saving a journal entry.
 * - SaveJournalEntryInput - The input type for the saveJournalEntry function.
 */

import { ai } from '@/ai/genkit';
import { addJournalEntry } from '@/services/journal-service';
import { z } from 'genkit';

const SaveJournalEntryInputSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type SaveJournalEntryInput = z.infer<typeof SaveJournalEntryInputSchema>;

export async function saveJournalEntry(input: SaveJournalEntryInput): Promise<void> {
    await saveJournalEntryFlow(input);
}

const saveJournalEntryFlow = ai.defineFlow(
    {
        name: 'saveJournalEntryFlow',
        inputSchema: SaveJournalEntryInputSchema,
        outputSchema: z.void(),
    },
    async (input) => {
        await addJournalEntry(input);
    }
);

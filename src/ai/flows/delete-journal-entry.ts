'use server';
/**
 * @fileOverview Deletes a journal entry from the database.
 * 
 * - deleteJournalEntry - A function that handles deleting a journal entry.
 */

import { deleteJournalEntry as deleteJournalEntryService } from '@/services/journal-service';

export async function deleteJournalEntry(entryId: string): Promise<void> {
    await deleteJournalEntryService(entryId);
}

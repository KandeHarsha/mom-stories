'use server';
/**
 * @fileOverview Updates a journal entry in the database.
 * 
 * - updateJournalEntry - A function that handles updating a journal entry.
 */

import { updateJournalEntry as updateJournalEntryService, type JournalEntry } from '@/services/journal-service';

export async function updateJournalEntry(entryId: string, data: Partial<Pick<JournalEntry, 'title' | 'content'>>): Promise<void> {
    await updateJournalEntryService(entryId, data);
}

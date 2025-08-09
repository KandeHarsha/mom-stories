'use server';
/**
 * @fileOverview Deletes a memory from the database.
 * 
 * - deleteMemory - A function that handles deleting a memory.
 */

import { deleteMemory as deleteMemoryService } from '@/services/memory-service';

export async function deleteMemory(memoryId: string): Promise<void> {
    await deleteMemoryService(memoryId);
}

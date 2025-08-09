'use server';
/**
 * @fileOverview Retrieves all memories for a user from the database.
 * 
 * - getMemories - A function that handles fetching memories.
 */

import { getMemories as getMemoriesService, type Memory } from '@/services/memory-service';

export async function getMemories(userId: string): Promise<Memory[]> {
    return await getMemoriesService(userId);
}

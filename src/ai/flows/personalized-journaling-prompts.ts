// src/ai/flows/personalized-journaling-prompts.ts
'use server';
/**
 * @fileOverview Provides personalized journaling prompts for mothers using AI.
 *
 * - generateJournalingPrompt - A function that generates personalized journaling prompts.
 * - GenerateJournalingPromptInput - The input type for the generateJournalingPrompt function.
 * - GenerateJournalingPromptOutput - The return type for the generateJournalingPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJournalingPromptInputSchema = z.object({
  stageOfMotherhood: z.string().describe('The current stage of motherhood the user is in (e.g., trying to conceive, pregnancy, postpartum).'),
  recentExperiences: z.string().describe('A brief description of recent experiences or feelings the mother wants to reflect on.'),
});
export type GenerateJournalingPromptInput = z.infer<typeof GenerateJournalingPromptInputSchema>;

const GenerateJournalingPromptOutputSchema = z.object({
  prompt: z.string().describe('A personalized journaling prompt to stimulate reflection.'),
});
export type GenerateJournalingPromptOutput = z.infer<typeof GenerateJournalingPromptOutputSchema>;

export async function generateJournalingPrompt(input: GenerateJournalingPromptInput): Promise<GenerateJournalingPromptOutput> {
  return generateJournalingPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJournalingPromptPrompt',
  input: {schema: GenerateJournalingPromptInputSchema},
  output: {schema: GenerateJournalingPromptOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized journaling prompts for mothers.

  Based on the mother's current stage of motherhood and her recent experiences, create a thought-provoking and insightful journaling prompt.
  The prompt should encourage reflection and help the mother capture meaningful moments in her motherhood journey.

  Stage of Motherhood: {{{stageOfMotherhood}}}
  Recent Experiences: {{{recentExperiences}}}

  Here is the journaling prompt:
  `,
});

const generateJournalingPromptFlow = ai.defineFlow(
  {
    name: 'generateJournalingPromptFlow',
    inputSchema: GenerateJournalingPromptInputSchema,
    outputSchema: GenerateJournalingPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

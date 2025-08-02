'use server';

/**
 * @fileOverview AI-Powered Support flow for new mothers.
 *
 * This flow provides supportive, non-clinical advice to new mothers based on their questions.
 * It aims to offer emotional support and practical guidance during the challenging postpartum period.
 *
 * @exports `aiPoweredSupport` - The main function to call for AI-powered support.
 * @exports `AiPoweredSupportInput` - The input type for the `aiPoweredSupport` function.
 * @exports `AiPoweredSupportOutput` - The output type for the `aiPoweredSupport` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredSupportInputSchema = z.object({
  question: z
    .string()
    .describe('The question the new mother is asking.'),
});
export type AiPoweredSupportInput = z.infer<typeof AiPoweredSupportInputSchema>;

const AiPoweredSupportOutputSchema = z.object({
  answer: z
    .string()
    .describe('The supportive, non-clinical advice from the AI.'),
});
export type AiPoweredSupportOutput = z.infer<typeof AiPoweredSupportOutputSchema>;

export async function aiPoweredSupport(input: AiPoweredSupportInput): Promise<AiPoweredSupportOutput> {
  return aiPoweredSupportFlow(input);
}

const aiPoweredSupportPrompt = ai.definePrompt({
  name: 'aiPoweredSupportPrompt',
  input: {schema: AiPoweredSupportInputSchema},
  output: {schema: AiPoweredSupportOutputSchema},
  prompt: `You are a compassionate and supportive AI assistant designed to provide non-clinical advice to new mothers.

  A new mother will ask a question related to pregnancy and raising her new child. Provide a response that is:
    - Supportive and encouraging.
    - Empathetic to the challenges of motherhood
    - Practical, with actionable advice where applicable, or general strategies and approaches where not.

  Question: {{{question}}}
  `,
});

const aiPoweredSupportFlow = ai.defineFlow(
  {
    name: 'aiPoweredSupportFlow',
    inputSchema: AiPoweredSupportInputSchema,
    outputSchema: AiPoweredSupportOutputSchema,
  },
  async input => {
    const {output} = await aiPoweredSupportPrompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Provides AI-driven suggestions for village-related content based on current trends and news.
 *
 * - suggestVillageContent - A function that generates content suggestions.
 */

import {ai} from '@/ai/genkit';
import {
    SuggestVillageContentInput,
    SuggestVillageContentInputSchema,
    SuggestVillageContentOutput,
    SuggestVillageContentOutputSchema,
} from './suggest-village-content.schema';

export async function suggestVillageContent(input: SuggestVillageContentInput): Promise<SuggestVillageContentOutput> {
  return suggestVillageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVillageContentPrompt',
  input: {schema: SuggestVillageContentInputSchema},
  output: {schema: SuggestVillageContentOutputSchema},
  prompt: `You are an AI assistant specialized in providing content suggestions for village development.

  Based on the village's name, recent news, and current trends, suggest engaging and relevant content ideas.

  Village Name: {{{villageName}}}
  Recent News: {{{recentNews}}}
  Current Trends: {{{currentTrends}}}

  Suggestions should be specific and actionable, aimed at informing and engaging the village residents.
  Provide at least 3 suggestions.

  Suggestions:
  `,
});

const suggestVillageContentFlow = ai.defineFlow(
  {
    name: 'suggestVillageContentFlow',
    inputSchema: SuggestVillageContentInputSchema,
    outputSchema: SuggestVillageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

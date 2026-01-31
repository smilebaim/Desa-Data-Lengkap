import { z } from 'zod';

export const SuggestVillageContentInputSchema = z.object({
  villageName: z.string().describe('The name of the village.'),
  recentNews: z.string().describe('The latest news related to the village.'),
  currentTrends: z.string().describe('The current trends in village development.'),
});
export type SuggestVillageContentInput = z.infer<typeof SuggestVillageContentInputSchema>;

export const SuggestVillageContentOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of content suggestions for the village.'),
});
export type SuggestVillageContentOutput = z.infer<typeof SuggestVillageContentOutputSchema>;

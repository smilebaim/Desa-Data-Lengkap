'use server';

import { suggestVillageContent } from '@/ai/flows/suggest-village-content';
import { SuggestVillageContentInput, SuggestVillageContentOutputSchema } from '@/ai/flows/suggest-village-content.schema';
import { z } from 'zod';

const ActionResponseSchema = z.object({
    success: z.boolean(),
    data: SuggestVillageContentOutputSchema.nullable(),
    error: z.string().nullable(),
});

type ActionResponse = z.infer<typeof ActionResponseSchema>;

export async function getAiSuggestions(input: SuggestVillageContentInput): Promise<ActionResponse> {
    try {
        const result = await suggestVillageContent(input);
        return { success: true, data: result, error: null };
    } catch (error) {
        console.error("AI suggestion error:", error);
        return { success: false, data: null, error: error instanceof Error ? error.message : "An unknown error occurred." };
    }
}


'use server';

/**
 * @fileOverview AI Flow untuk menghasilkan saran konten profil desa.
 */

import { ai, z } from '@/lib/ai-setup';

const SuggestVillageContentInputSchema = z.object({
  name: z.string().describe('Nama desa'),
  province: z.string().describe('Provinsi lokasi desa'),
});

const SuggestVillageContentOutputSchema = z.object({
  description: z.string().describe('Deskripsi profil desa yang informatif dan menarik'),
  potentials: z.array(z.string()).describe('Daftar potensi wilayah (misal: Pertanian, Wisata Bahari, Kerajinan Tangan)'),
  tagline: z.string().describe('Slogan pendek yang inspiratif untuk desa tersebut'),
});

export type SuggestVillageContentInput = z.infer<typeof SuggestVillageContentInputSchema>;
export type SuggestVillageContentOutput = z.infer<typeof SuggestVillageContentOutputSchema>;

const suggestPrompt = ai.definePrompt({
  name: 'suggestVillageContentPrompt',
  input: { schema: SuggestVillageContentInputSchema },
  output: { schema: SuggestVillageContentOutputSchema },
  prompt: `Anda adalah asisten ahli pembangunan desa dan geospasial di Indonesia. 

Berikan saran konten profil untuk desa berikut berdasarkan lokasi geografisnya:
Nama Desa: {{{name}}}
Provinsi: {{{province}}}

Buatlah deskripsi yang profesional, identifikasi potensi yang relevan dengan karakteristik umum wilayah di provinsi tersebut, dan buatkan tagline yang menarik.`,
});

export async function suggestVillageContent(input: SuggestVillageContentInput): Promise<SuggestVillageContentOutput> {
  const { output } = await suggestPrompt(input);
  if (!output) throw new Error('Gagal menghasilkan saran konten desa');
  return output;
}

export const suggestVillageContentFlow = ai.defineFlow(
  {
    name: 'suggestVillageContentFlow',
    inputSchema: SuggestVillageContentInputSchema,
    outputSchema: SuggestVillageContentOutputSchema,
  },
  async (input) => {
    return suggestVillageContent(input);
  }
);

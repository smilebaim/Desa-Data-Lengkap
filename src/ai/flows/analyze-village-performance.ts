
'use server';

/**
 * @fileOverview AI Flow untuk menganalisis performa desa berdasarkan data IDM dan Anggaran.
 */

import { ai, z } from '@/lib/ai-setup';

const AnalyzeVillageInputSchema = z.object({
  name: z.string(),
  idmScore: z.number(),
  budget: z.number(),
  potentials: z.array(z.string()).optional(),
});

const AnalyzeVillageOutputSchema = z.object({
  analysis: z.string().describe('Analisis mendalam tentang kondisi desa saat ini'),
  recommendations: z.array(z.string()).describe('Rekomendasi strategis untuk meningkatkan kemandirian desa'),
  efficiencyLevel: z.string().describe('Tingkat efisiensi penggunaan anggaran (Tinggi/Sedang/Perlu Evaluasi)'),
});

export type AnalyzeVillageInput = z.infer<typeof AnalyzeVillageInputSchema>;
export type AnalyzeVillageOutput = z.infer<typeof AnalyzeVillageOutputSchema>;

const analyzePrompt = ai.definePrompt({
  name: 'analyzeVillagePerformancePrompt',
  input: { schema: AnalyzeVillageInputSchema },
  output: { schema: AnalyzeVillageOutputSchema },
  prompt: `Anda adalah konsultan ahli pembangunan desa di Indonesia. 
Analisis data berikut untuk Desa {{{name}}}:
- Skor IDM: {{{idmScore}}} (Skala 0-1)
- Anggaran: Rp{{{budget}}}
- Potensi: {{#each potentials}}{{{this}}}, {{/each}}

Berikan analisis kritis mengenai apakah anggaran tersebut sudah efektif dalam meningkatkan kemandirian desa (IDM). Berikan rekomendasi spesifik berbasis potensi desa tersebut untuk percepatan status Desa Mandiri.`,
});

export async function analyzeVillagePerformance(input: AnalyzeVillageInput): Promise<AnalyzeVillageOutput> {
  const { output } = await analyzePrompt(input);
  if (!output) throw new Error('Gagal melakukan analisis AI');
  return output;
}

export const analyzeVillagePerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeVillagePerformanceFlow',
    inputSchema: AnalyzeVillageInputSchema,
    outputSchema: AnalyzeVillageOutputSchema,
  },
  async (input) => {
    return analyzeVillagePerformance(input);
  }
);

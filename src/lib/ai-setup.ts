
'use server';

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Inisialisasi utama Genkit v1.x.
 * Menggunakan nama file unik 'ai-setup.ts' untuk menghindari shadowing paket npm 'genkit'.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

export { z };

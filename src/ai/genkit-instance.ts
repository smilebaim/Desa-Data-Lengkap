
'use client';

/**
 * Barrel export untuk instansi AI.
 * Mengambil dari src/lib/ai-setup untuk menghindari shadowing modul 'genkit'.
 */
import { ai, z } from '@/lib/ai-setup';

export { ai, z };

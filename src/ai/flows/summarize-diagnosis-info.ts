'use server';

/**
 * @fileOverview Summarizes detailed diagnosis information into a concise format.
 *
 * - summarizeDiagnosis - A function that summarizes diagnosis information.
 * - SummarizeDiagnosisInput - The input type for the summarizeDiagnosis function.
 * - SummarizeDiagnosisOutput - The return type for the summarizeDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDiagnosisInputSchema = z.object({
  diagnosis: z.string().describe('The detailed diagnosis information.'),
  confidence: z.number().describe('The confidence level of the diagnosis (0-1).'),
  info: z.string().describe('Additional information about the diagnosis.'),
  recommend: z.string().describe('Recommendation based on the diagnosis.'),
});
export type SummarizeDiagnosisInput = z.infer<typeof SummarizeDiagnosisInputSchema>;

const SummarizeDiagnosisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the diagnosis information.'),
});
export type SummarizeDiagnosisOutput = z.infer<typeof SummarizeDiagnosisOutputSchema>;

export async function summarizeDiagnosis(input: SummarizeDiagnosisInput): Promise<SummarizeDiagnosisOutput> {
  return summarizeDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDiagnosisPrompt',
  input: {schema: SummarizeDiagnosisInputSchema},
  output: {schema: SummarizeDiagnosisOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing medical diagnosis information for patients.

  Summarize the following diagnosis information in a concise and easy-to-understand manner. Focus on the key aspects of the diagnosis, confidence level, and recommendations. The summary should be no more than 50 words.

  Diagnosis: {{{diagnosis}}}
  Confidence Level: {{{confidence}}}
  Additional Information: {{{info}}}
  Recommendation: {{{recommend}}}
  `,
});

const summarizeDiagnosisFlow = ai.defineFlow(
  {
    name: 'summarizeDiagnosisFlow',
    inputSchema: SummarizeDiagnosisInputSchema,
    outputSchema: SummarizeDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

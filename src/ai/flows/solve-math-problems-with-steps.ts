'use server';
/**
 * @fileOverview A math problem solver AI agent that provides step-by-step solutions.
 *
 * - solveMathProblemWithSteps - A function that handles the math problem-solving process.
 * - SolveMathProblemWithStepsInput - The input type for the solveMathProblemWithSteps function.
 * - SolveMathProblemWithStepsOutput - The return type for the solveMathProblemWithSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveMathProblemWithStepsInputSchema = z.object({
  problem: z.string().describe('The math problem to solve, either typed or a description of an image containing the problem.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a math problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Only include if the problem is handwritten or in an image."
    ),
});
export type SolveMathProblemWithStepsInput = z.infer<typeof SolveMathProblemWithStepsInputSchema>;

const SolveMathProblemWithStepsOutputSchema = z.object({
  solution: z.array(z.string()).describe('The step-by-step solution to the math problem, where each string is one step.'),
});
export type SolveMathProblemWithStepsOutput = z.infer<typeof SolveMathProblemWithStepsOutputSchema>;

export async function solveMathProblemWithSteps(input: SolveMathProblemWithStepsInput): Promise<SolveMathProblemWithStepsOutput> {
  return solveMathProblemWithStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveMathProblemWithStepsPrompt',
  input: {schema: SolveMathProblemWithStepsInputSchema},
  output: {schema: SolveMathProblemWithStepsOutputSchema},
  prompt: `You are an expert math tutor. You will provide a step-by-step solution to the math problem.
Break down the solution into clear, individual steps. Each step MUST be a separate item in the 'solution' array.

  Problem: {{{problem}}}
  {{#if imageDataUri}}
  Image: {{media url=imageDataUri}}
  {{/if}}
`,
});

const solveMathProblemWithStepsFlow = ai.defineFlow(
  {
    name: 'solveMathProblemWithStepsFlow',
    inputSchema: SolveMathProblemWithStepsInputSchema,
    outputSchema: SolveMathProblemWithStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview A multi-purpose AI flow that can either generate a quiz from notes,
 * or evaluate a user's answers to a previously generated quiz.
 *
 * - generateAndEvaluateQuiz - A function that handles both quiz generation and evaluation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input for the GENERATION step
const GenerateQuizInputSchema = z.object({
  notes: z.string().describe('The study notes or document content to generate a quiz from.'),
});

// Output for the GENERATION step
const GenerateQuizOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe("A generated quiz question based on the notes."),
    answer: z.string().describe("The correct answer to the generated question."),
  })).describe('An array of generated quiz questions and their correct answers.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// Input for the EVALUATION step
const EvaluateQuizInputSchema = z.object({
  questionsAndAnswers: z.array(z.object({
    question: z.string(),
    correctAnswer: z.string(),
    studentAnswer: z.string(),
  })),
});
export type EvaluateQuizInput = z.infer<typeof EvaluateQuizInputSchema>;

// Output for the EVALUATION step
const EvaluateQuizOutputSchema = z.object({
  evaluation: z.array(z.object({
    question: z.string().describe("The original quiz question."),
    studentAnswer: z.string().describe("The student's answer for this question."),
    correctAnswer: z.string().describe("The correct answer for the question."),
    isCorrect: z.boolean().describe("Whether the student's answer was correct."),
    feedback: z.string().describe("Specific feedback for this individual answer, explaining why it's right or wrong."),
  })).describe("A detailed, per-question evaluation."),
  overallFeedback: z.string().describe("A summary of the student's performance and general feedback."),
  score: z.number().describe('The final score as a percentage (0-100).'),
});
export type EvaluateQuizOutput = z.infer<typeof EvaluateQuizOutputSchema>;


// The main exported function that determines which flow to run.
export async function generateAndEvaluateQuiz(
  input: z.infer<typeof GenerateQuizInputSchema> | z.infer<typeof EvaluateQuizInputSchema>
) {
  if ('notes' in input) {
    return generateQuizFlow(input);
  }
  return evaluateQuizFlow(input);
}


// Flow for GENERATING the quiz
const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an AI that creates quizzes. Given the following notes, generate a set of 5-7 questions that test the key concepts. For each question, provide the correct answer.

Notes:
{{{notes}}}
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuizPrompt(input);
    return output!;
  }
);


// Flow for EVALUATING the quiz
const evaluateQuizPrompt = ai.definePrompt({
  name: 'evaluateQuizPrompt',
  input: { schema: EvaluateQuizInputSchema },
  output: { schema: EvaluateQuizOutputSchema },
  prompt: `You are an AI teacher. Your task is to evaluate a student's quiz answers based on the provided questions and correct answers. For each item, determine if the student's answer is correct. Be lenient with minor phrasing differences if the core concept is right. Provide specific feedback for each answer. Finally, calculate a final score and give overall constructive feedback.

Here is the quiz data:
{{#each questionsAndAnswers}}
- Question: {{question}}
  - Correct Answer: {{correctAnswer}}
  - Student's Answer: {{studentAnswer}}
---
{{/each}}
`,
});

const evaluateQuizFlow = ai.defineFlow(
  {
    name: 'evaluateQuizFlow',
    inputSchema: EvaluateQuizInputSchema,
    outputSchema: EvaluateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await evaluateQuizPrompt(input);
    return output!;
  }
);

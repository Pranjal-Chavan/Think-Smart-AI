"use client";

import { useTransition, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateAndEvaluateQuiz, GenerateQuizOutput, EvaluateQuizInput, EvaluateQuizOutput } from "@/ai/flows/generate-and-evaluate-quiz";
import { Loader2, Sparkles, CheckCircle, XCircle, ArrowRight, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import pdf from 'pdf-parse';

type QuizState = 'generate' | 'take' | 'results';

export default function QuizGeneratorPage() {
  const [isGenerating, startGenerating] = useTransition();
  const [isEvaluating, startEvaluating] = useTransition();
  const [quizState, setQuizState] = useState<QuizState>('generate');
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput['questions']>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateQuizOutput | null>(null);
  const { toast } = useToast();
  
  const methods = useForm<{ answers: { userAnswer: string }[] }>({
    defaultValues: { answers: [] }
  });
  const { fields, append } = useFieldArray({
    control: methods.control,
    name: "answers"
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
      return;
    }

    startGenerating(async () => {
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdfData = await pdf(fileBuffer);
        const notes = pdfData.text;
        
        handleGenerate(notes);

      } catch (error) {
        console.error("PDF Parsing error:", error);
        toast({ variant: "destructive", title: "PDF Read Error", description: "Could not read the content of the PDF."});
      }
    });
  }

  const handleGenerate = (notes: string) => {
    if (!notes.trim()) {
      toast({ variant: "destructive", title: "No notes provided", description: "Please enter some notes to generate a quiz from." });
      return;
    }

    startGenerating(async () => {
      try {
        const result = await generateAndEvaluateQuiz({ notes });
        if (result.questions && result.questions.length > 0) {
          setGeneratedQuiz(result.questions);
          // @ts-ignore
          methods.reset({ answers: result.questions.map(() => ({ userAnswer: '' })) });
          setQuizState('take');
        } else {
          toast({ variant: "destructive", title: "Generation Failed", description: "The AI couldn't generate a quiz. Please try again." });
        }
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "An Error Occurred", description: "Failed to generate quiz. Please try again later." });
      }
    });
  };

  const handleEvaluationSubmit = methods.handleSubmit((data) => {
    const evaluationInput: EvaluateQuizInput = {
      questionsAndAnswers: generatedQuiz.map((q, i) => ({
        question: q.question,
        correctAnswer: q.answer,
        studentAnswer: data.answers[i].userAnswer
      }))
    };

    startEvaluating(async () => {
        try {
            const result = await generateAndEvaluateQuiz(evaluationInput);
            // @ts-ignore
            setEvaluationResult(result);
            setQuizState('results');
        } catch(error) {
            console.error(error);
            toast({ variant: "destructive", title: "Evaluation Failed", description: "The AI could not evaluate this quiz." });
        }
    });
  });

  const isPending = isGenerating || isEvaluating;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">AI Quiz Generator</h1>
          <p className="text-muted-foreground">Upload your notes as a PDF and get a custom quiz in seconds.</p>
        </div>

        {quizState === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle>Generate a New Quiz</CardTitle>
              <CardDescription>Upload a PDF of your notes, or paste the text below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload PDF</Label>
                <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} disabled={isPending} />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate((document.getElementById('notes-text') as HTMLTextAreaElement).value);
              }}>
                <div className="space-y-2">
                  <Label htmlFor="notes-text">Paste Your Notes</Label>
                  <Textarea id="notes-text" placeholder="Paste your study notes here..." className="min-h-[200px]" disabled={isPending} />
                </div>
                <Button type="submit" disabled={isPending} className="mt-4">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Quiz
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {quizState === 'take' && (
           <FormProvider {...methods}>
            <form onSubmit={handleEvaluationSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Your Custom Quiz</CardTitle>
                  <CardDescription>Answer the questions below to the best of your ability.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`answers.${index}.userAnswer`}>{index + 1}. {generatedQuiz[index].question}</Label>
                      <Textarea 
                        id={`answers.${index}.userAnswer`}
                        {...methods.register(`answers.${index}.userAnswer`)}
                        placeholder="Your answer..."
                        disabled={isPending}
                      />
                    </div>
                  ))}
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isEvaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Submit for Evaluation
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        )}

        {quizState === 'results' && evaluationResult && (
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Results</CardTitle>
                    <CardDescription>Here's how you did on the quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                        <span className="text-lg font-medium text-foreground">Final Score</span>
                        <span className="text-3xl font-bold text-primary">{evaluationResult.score}/100</span>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold">Per-Question Breakdown</h3>
                      {evaluationResult.evaluation.map((item, index) => (
                        <div key={index} className="space-y-3 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                              <p className="font-semibold text-foreground">{item.question}</p>
                              {item.isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                  <XCircle className="h-5 w-5 text-destructive" />
                              )}
                          </div>
                          <div className={cn("rounded-md bg-muted/50 p-3", !item.isCorrect && "border-l-2 border-destructive")}>
                              <p className="text-muted-foreground"><span className="font-medium text-foreground">Your Answer: </span>{item.studentAnswer}</p>
                          </div>
                          {!item.isCorrect && (
                             <div className="rounded-md bg-green-500/10 p-3 border-l-2 border-green-500">
                              <p className="text-muted-foreground"><span className="font-medium text-foreground">Correct Answer: </span>{item.correctAnswer}</p>
                          </div>
                          )}
                           <div className="text-muted-foreground">
                            <p><span className="font-medium text-foreground">Feedback: </span>{item.feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <h3 className="text-base font-semibold">Overall Feedback</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{evaluationResult.overallFeedback}</p>
                    </div>
                    <Button onClick={() => { setQuizState('generate'); setEvaluationResult(null); setGeneratedQuiz([]); }} className="w-full">
                        Create Another Quiz
                    </Button>
                </CardContent>
            </Card>
        )}

      </div>
    </AppLayout>
  );
}

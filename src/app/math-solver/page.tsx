"use client";

import { useTransition, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { solveMathProblemWithSteps, SolveMathProblemWithStepsOutput } from "@/ai/flows/solve-math-problems-with-steps";
import { Loader2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

export default function MathSolverPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SolveMathProblemWithStepsOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    
    const formData = new FormData(e.currentTarget);
    const problem = formData.get("problem") as string;
    const imageFile = formData.get("image-problem") as File;

    if (!problem.trim() && (!imageFile || imageFile.size === 0)) {
      toast({ variant: "destructive", title: "No Problem Provided", description: "Please enter a math problem or upload an image." });
      return;
    }
    
    let imageDataUriPromise: Promise<string | undefined> = Promise.resolve(undefined);

    if (imageFile && imageFile.size > 0) {
      imageDataUriPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }

    startTransition(async () => {
      try {
        const imageDataUri = await imageDataUriPromise;
        const solutionResult = await solveMathProblemWithSteps({
          problem,
          imageDataUri,
        });
        setResult(solutionResult);
      } catch (error) {
        console.error("Math Solver Error:", error);
        let description = "Failed to solve the math problem. Please try again.";
        if (error instanceof Error && error.message.includes('API key')) {
          description = "The AI feature is not configured. Please ensure you have set up your GEMINI_API_KEY in a .env file.";
        }
        toast({
          variant: "destructive",
          title: "Solver Error",
          description: description,
        });
      }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">AI Math Solver</h1>
          <p className="text-muted-foreground">Get step-by-step solutions for your math problems, from algebra to calculus.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Math Problem</CardTitle>
                        <CardDescription>Type your problem or upload an image of it.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="problem">Type your problem</Label>
                            <Textarea id="problem" name="problem" placeholder="e.g., Solve for x: 2x + 5 = 15" className="min-h-[100px]" disabled={isPending} />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-problem">Upload an image of your problem</Label>
                            <Input id="image-problem" name="image-problem" type="file" accept="image/*" disabled={isPending} />
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                            Solve Problem
                        </Button>
                    </CardContent>
                </Card>
            </form>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Solution</CardTitle>
                    <CardDescription>The step-by-step solution will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                     {isPending && (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span>Solving...</span>
                        </div>
                    )}
                    {result && (
                        <div className="w-full space-y-4">
                            <h3 className="font-semibold text-foreground">Step-by-step solution:</h3>
                            <ul className="space-y-4">
                                {result.solution.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                                            <span className="text-xs font-bold">{index + 1}</span>
                                        </div>
                                        <p className="flex-1 text-sm text-muted-foreground">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     {!isPending && !result && (
                        <div className="text-center text-muted-foreground">
                            <p>Submit a problem to see the solution.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}

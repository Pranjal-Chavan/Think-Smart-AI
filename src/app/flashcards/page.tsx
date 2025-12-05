"use client";

import { useTransition, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateFlashcards, GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards-from-notes";
import { Loader2, Wand2 } from "lucide-react";
import { Flashcard } from "@/components/ui/flashcard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Flashcard = { front: string; back: string };

export default function FlashcardsPage() {
  const [notes, setNotes] = useState("");
  const [flashcards, setFlashcards] =useState<Flashcard[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!notes.trim()) {
      toast({
        variant: "destructive",
        title: "No notes provided",
        description: "Please enter some notes to generate flashcards from.",
      });
      return;
    }
    
    startTransition(async () => {
      try {
        const result: GenerateFlashcardsOutput = await generateFlashcards({ notes });
        if (result.flashcards && result.flashcards.length > 0) {
          setFlashcards(result.flashcards);
        } else {
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "The AI couldn't generate flashcards from your notes. Please try again with different content.",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "An Error Occurred",
          description: "Failed to generate flashcards. Please try again later.",
        });
      }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Smart Flashcard Generator</h1>
          <p className="text-muted-foreground">Enter your notes and let AI create interactive flashcards for you.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
            <CardDescription>Paste your study notes here. The AI will identify key concepts and generate flashcards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., The mitochondria is the powerhouse of the cell, responsible for generating most of the cell's supply of adenosine triphosphate (ATP)..."
              className="min-h-[200px] text-base"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
            />
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Flashcards
            </Button>
          </CardContent>
        </Card>
        
        {isPending && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Generating...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
        )}

        {flashcards.length > 0 && !isPending && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Generated Flashcards</h2>
            <p className="text-muted-foreground mb-6">Click on any card to flip it and reveal the answer.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card, index) => (
                <Flashcard key={index} front={card.front} back={card.back} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
}

export function Flashcard({ front, back }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group h-64 w-full cursor-pointer [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      aria-label="Flip flashcard"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative h-full w-full rounded-xl shadow-lg transition-transform duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front of the card */}
        <Card className="absolute flex h-full w-full flex-col items-center justify-center [backface-visibility:hidden]">
          <CardContent className="flex h-full items-center justify-center p-6">
            <p className="text-center text-lg font-semibold">{front}</p>
          </CardContent>
          <div className="absolute bottom-3 right-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <RefreshCw size={16} />
          </div>
        </Card>
        {/* Back of the card */}
        <Card className="absolute flex h-full w-full flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardContent className="flex h-full items-center justify-center p-6">
            <p className="text-center text-muted-foreground">{back}</p>
          </CardContent>
           <div className="absolute bottom-3 right-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <RefreshCw size={16} />
          </div>
        </Card>
      </div>
    </div>
  );
}

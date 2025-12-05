"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { generalChat, GeneralChatOutput } from "@/ai/flows/general-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth-provider";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";

type Message = {
  id?: string;
  role: "user" | "bot";
  content: string;
  createdAt?: any;
};

// Store messages in a simple cache to prevent re-fetching on navigation
let messageCache: Message[] = [];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(messageCache);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaViewport = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const db = useFirestore();

  useEffect(() => {
    // Only fetch history if the cache is empty and the user is logged in
    if (user && db && messageCache.length === 0) {
      const q = query(collection(db, "users", user.uid, "chatHistory"), orderBy("createdAt"));
      getDocs(q).then(querySnapshot => {
        const history: Message[] = [];
        querySnapshot.forEach((doc) => {
          history.push({ id: doc.id, ...doc.data() } as Message);
        });
        messageCache = history;
        setMessages(history);
      });
    }

    // If the user logs out, clear the cache
    if (!user) {
        messageCache = [];
        setMessages([]);
    }

    // Set up the real-time listener
    if (user && db) {
        const q = query(collection(db, "users", user.uid, "chatHistory"), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const history: Message[] = [];
            querySnapshot.forEach((doc) => {
                history.push({ id: doc.id, ...doc.data() } as Message);
            });
            messageCache = history;
            setMessages(history);
        });

        return () => unsubscribe();
    }
  }, [user, db]);

  const saveMessage = async (message: Message) => {
    if (user && db) {
      await addDoc(collection(db, "users", user.uid, "chatHistory"), {
        ...message,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    
    // Optimistically update UI
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    messageCache = newMessages;

    const userInput = input;
    setInput("");

    // Save user message to firestore (no need to await)
    saveMessage(userMessage);

    startTransition(async () => {
      try {
        const result: GeneralChatOutput = await generalChat({ question: userInput });
        const botMessage: Message = { role: "bot", content: result.answer };
        
        // This will be updated by the onSnapshot listener, but we can also update it here
        const finalMessages = [...newMessages, botMessage];
        setMessages(finalMessages);
        messageCache = finalMessages;

        await saveMessage(botMessage);
      } catch (error) {
        console.error(error);
        const errorMessage: Message = { role: "bot", content: "Sorry, I encountered an error. Please try again." };
        
        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
        messageCache = finalMessages;

        await saveMessage(errorMessage);
      }
    });
  };

  useEffect(() => {
    if (scrollAreaViewport.current) {
        scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">AI Chat Tutor</h1>
          <p className="text-muted-foreground">Ask me anything! I'm here to help you learn and understand concepts.</p>
        </div>
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1 pr-4 -mr-4">
               <div className="space-y-4" ref={scrollAreaViewport}>
                {messages.map((message, index) => (
                  <div key={message.id || index} className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                    {message.role === "bot" && (
                      <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                        <AvatarFallback><Bot size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg p-3 max-w-[75%] shadow-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                            <AvatarFallback><Bot size={18} /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 bg-card shadow-sm">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Explain the concept of photosynthesis..."
                disabled={isPending}
                className="text-base"
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

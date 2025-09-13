
// src/components/features/ai-support-view.tsx
'use client';

import React, { useState, useRef, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartHandshake, Loader2, Send, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type Memory } from '@/services/memory-service';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  questionForAi?: string;
}

function AiSupportComponent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get('question');
  const [isSaving, startSaveTransition] = useTransition();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI companion for emotional and practical support. I'm here to listen without judgment. What's on your mind? Please remember, I'm not a medical professional.",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleSaveResponse = (question: string, answer: string) => {
    const formData = new FormData();
    formData.append('title', `AI: ${question}`);
    formData.append('text', answer);
    formData.append('isAiResponse', 'true');
    
    startSaveTransition(async () => {
      try {
        const response = await fetch('/api/memories', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to save response');
        }
        toast({
          title: 'Response Saved!',
          description: 'You can find this response in your Saved Answers.',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: errorMessage,
        });
      }
    });
  }

  const fetchAnswer = (question: string) => {
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now(), text: question, sender: 'user' },
    ];
    setMessages(newMessages);

    startTransition(async () => {
      try {
        const response = await fetch('/api/ai-support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Failed to get an answer.');
        }

        if (result.answer) {
            setMessages((prev) => [
              ...prev,
              { id: Date.now() + 1, text: result.answer!, sender: 'ai', questionForAi: question },
            ]);
        }
      } catch(error) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message,
        });
        // Revert optimistic update on error
        setMessages(messages);
      }
    });
  };

  useEffect(() => {
    if (initialQuestion) {
      setTimeout(() => fetchAnswer(initialQuestion), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    fetchAnswer(input);
    setInput('');
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
            scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <HeartHandshake className="h-8 w-8 text-primary"/>
                Gentle AI Support
            </h2>
            <p className="text-muted-foreground mt-1">
                A safe space for your questions and feelings. Non-clinical, empathetic guidance is a tap away.
            </p>
        </div>
        <div className="w-full max-w-3xl mx-auto h-[70vh] flex flex-col">
            <ScrollArea className="flex-grow rounded-lg border p-4 h-full" ref={scrollAreaRef}>
                <div className="space-y-6">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-start gap-4',
                        message.sender === 'user' ? 'justify-end' : ''
                    )}
                    >
                    {message.sender === 'ai' && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            <HeartHandshake className="h-4 w-4" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col gap-2 items-end">
                      <div
                          className={cn(
                          'max-w-md rounded-lg p-3 text-sm',
                          message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          )}
                      >
                          {message.text}
                      </div>
                      {message.sender === 'ai' && message.questionForAi && (
                        <Button variant="ghost" size="sm" onClick={() => handleSaveResponse(message.questionForAi!, message.text)} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                           Save for later
                        </Button>
                      )}
                    </div>
                     {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isPending && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <HeartHandshake className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                         <div className="max-w-md rounded-lg p-3 text-sm bg-secondary flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                            Thinking...
                         </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <form
                onSubmit={handleSubmit}
                className="mt-4 flex w-full items-center space-x-2"
            >
                <Input
                id="message"
                placeholder="Type your question or feeling here..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isPending}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isPending}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    </div>
  );
}

export default function AiSupportView() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AiSupportComponent />
        </Suspense>
    )
}

// src/components/features/ai-support-view.tsx
'use client';

import React, { useState, useRef, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartHandshake, Loader2, Send } from 'lucide-react';
import { getSupportAnswer } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

function AiSupportComponent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get('question');

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

  const fetchAnswer = (question: string) => {
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now(), text: question, sender: 'user' },
    ];
    setMessages(newMessages);

    const formData = new FormData();
    formData.append('question', question);

    startTransition(async () => {
      const result = await getSupportAnswer(formData);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        // Revert optimistic update on error
        setMessages(messages); 
      } else if (result.answer) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: result.answer!, sender: 'ai' },
        ]);
      }
    });
  };

  useEffect(() => {
    if (initialQuestion) {
      // Use a timeout to ensure the state has settled from the initial render
      setTimeout(() => fetchAnswer(initialQuestion), 0);
    }
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

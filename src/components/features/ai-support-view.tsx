
// src/components/features/ai-support-view.tsx
'use client';

import React, { useState, useRef, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartHandshake, Loader2, Send, Bookmark, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type Memory } from '@/services/memory-service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  questionForAi?: string;
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

  const [view, setView] = useState<'chat' | 'saved'>('chat');
  const [savedAnswers, setSavedAnswers] = useState<Memory[]>([]);
  const [isLoadingSaved, startLoadingSavedTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchSavedAnswers = () => {
    startLoadingSavedTransition(async () => {
      try {
        const response = await fetch('/api/memories?isAiResponse=true', {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch saved answers');
        }
        const fetchedMemories = await response.json();
        setSavedAnswers(fetchedMemories);
        setView('saved');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: 'Failed to fetch your saved answers.',
        });
      }
    });
  };

  const handleDelete = (memoryId: string) => {
    startDeleteTransition(async () => {
        try {
            const response = await fetch(`/api/memories/${memoryId}`, {
                method: 'DELETE',
                 headers: getAuthHeaders(),
            });
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete saved answer');
            }
            toast({
                title: 'Deleted',
                description: 'The saved answer has been deleted.',
            });
            // Refetch after delete
            const updatedAnswers = savedAnswers.filter(a => a.id !== memoryId);
            setSavedAnswers(updatedAnswers);

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


  const handleSaveResponse = (question: string, answer: string) => {
    const formData = new FormData();
    formData.append('title', `AI: ${question}`);
    formData.append('text', answer);
    formData.append('isAiResponse', 'true');
    
    startSaveTransition(async () => {
      try {
        const response = await fetch('/api/memories', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('session_token')}` },
            body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to save response');
        }
        toast({
          title: 'Response Saved!',
          description: 'You can find this response in your saved answers.',
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
    setView('chat'); // Switch back to chat view if user asks a new question
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
    if (initialQuestion && view === 'chat') {
      setTimeout(() => fetchAnswer(initialQuestion), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, view]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    fetchAnswer(input);
    setInput('');
  };

  useEffect(() => {
    if (view === 'chat' && scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
            scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages, view]);

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <HeartHandshake className="h-8 w-8 text-primary"/>
                    Gentle AI Support
                </h2>
                <p className="text-muted-foreground mt-1">
                    {view === 'chat' 
                        ? "A safe space for your questions and feelings. Non-clinical, empathetic guidance is a tap away."
                        : "Review the helpful advice you've saved from your AI companion."
                    }
                </p>
            </div>
             <Button 
                variant="outline" 
                className="mt-4 md:mt-0"
                onClick={() => view === 'chat' ? fetchSavedAnswers() : setView('chat')}
                disabled={isLoadingSaved}
            >
                {isLoadingSaved ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : (view === 'chat' ? <Eye className="mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4" />) }
                {view === 'chat' ? 'View Saved' : 'Back to Chat'}
            </Button>
        </div>
        <div className="w-full max-w-3xl mx-auto h-[70vh] flex flex-col">
            {view === 'chat' ? (
                 <>
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
                </>
            ) : (
                <ScrollArea className="flex-grow rounded-lg border p-4 h-full">
                     {savedAnswers.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center h-full text-center p-6 border-none shadow-none">
                            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">No Saved Answers Yet</h3>
                            <p className="text-muted-foreground mt-2">Go back to the chat to ask a question and save the response.</p>
                        </Card>
                     ) : (
                         <Accordion type="single" collapsible className="w-full">
                            {savedAnswers.map(answer => (
                               <AccordionItem value={answer.id} key={answer.id}>
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        <div className="flex justify-between items-center w-full pr-4">
                                             <span className="flex-1 font-medium">{answer.title.replace('AI: ', '')}</span>
                                             <span className="text-xs text-muted-foreground">{answer.createdAt}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                       <div className="p-4 bg-background rounded-lg space-y-4">
                                            <p className="whitespace-pre-wrap text-sm">{answer.text}</p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                                                        {isDeleting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Trash2 className="mr-2 h-3 w-3" />}
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this saved answer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(answer.id)}>
                                                            Continue
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                       </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                     )}
                </ScrollArea>
            )}
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

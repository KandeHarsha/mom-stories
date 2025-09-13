
// src/components/features/saved-answers-view.tsx
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2, Trash2, BookHeart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Memory } from '@/services/memory-service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function SavedAnswersView() {
  const { toast } = useToast();
  const [isLoading, startLoadingTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [savedAnswers, setSavedAnswers] = useState<Memory[]>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchSavedAnswers = () => {
    startLoadingTransition(async () => {
      try {
        const response = await fetch('/api/memories?isAiResponse=true', {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch saved answers');
        }
        const fetchedMemories = await response.json();
        setSavedAnswers(fetchedMemories);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: 'Failed to fetch your saved answers.',
        });
      }
    });
  };

  useEffect(() => {
    fetchSavedAnswers();
  }, []);

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
            fetchSavedAnswers();
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

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Bookmark className="h-8 w-8 text-primary"/>
                Saved Answers
            </h2>
            <p className="text-muted-foreground mt-1">
                Review the helpful advice and insights you've saved from your AI companion.
            </p>
        </div>
      
        <div className="mt-6 max-w-3xl mx-auto">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : savedAnswers.length === 0 ? (
                <Card className="flex flex-col items-center justify-center h-64 text-center p-6">
                    <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Saved Answers Yet</h3>
                    <p className="text-muted-foreground mt-2">Visit the Gentle AI Support page to ask a question and save the response.</p>
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
                               <div className="p-4 bg-secondary rounded-lg space-y-4">
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
        </div>
    </div>
  );
}

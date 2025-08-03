// src/components/features/journal-view.tsx
'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookHeart, ImagePlus, Mic, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { saveJournalEntryAction } from '@/app/actions';
import type { View } from '@/app/page';
import { getJournalEntries, type JournalEntry } from '@/services/journal-service';

export default function JournalView({ setActiveView }: { setActiveView: (view: View) => void; }) {
  const { toast } = useToast();
  const [isSaving, startSaveTransition] = useTransition();
  const [isLoading, startLoadingTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState('entries');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const fetchEntries = () => {
    startLoadingTransition(async () => {
      try {
        // Using a dummy user ID as per current implementation
        const fetchedEntries = await getJournalEntries('dummy-user-id');
        setEntries(fetchedEntries);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: 'Failed to fetch your journal entries.',
        });
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'entries') {
      fetchEntries();
    }
  }, [activeTab]);

  const handleSave = (formData: FormData) => {
    startSaveTransition(async () => {
      const result = await saveJournalEntryAction(formData);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: result.error,
        });
      } else if (result.success) {
        toast({
          title: 'Entry Saved!',
          description: 'Your journal entry has been saved successfully.',
        });
        formRef.current?.reset();
        fetchEntries(); // Refetch entries to show the new one
        setActiveTab('entries');
      }
    });
  };

  return (
    <div>
        <div className="mb-6">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Your Private Journal</h2>
            <p className="text-muted-foreground mt-1">A safe space to capture every moment, thought, and feeling.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="entries">My Entries</TabsTrigger>
                <TabsTrigger value="new">New Entry</TabsTrigger>
            </TabsList>
            <TabsContent value="entries" className="mt-6">
                 {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                 ) : entries.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center h-64 text-center p-6">
                        <BookHeart className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Your Journal is Empty</h3>
                        <p className="text-muted-foreground mt-2">Click on the "New Entry" tab to write your first memory.</p>
                    </Card>
                 ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {entries.map(entry => (
                            <Card key={entry.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{entry.title}</CardTitle>
                                    <CardDescription>{entry.createdAt}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    {entry.imageUrl && <div className="mb-4 rounded-lg overflow-hidden"><Image src={entry.imageUrl} alt={entry.title} width={600} height={400} data-ai-hint="journal entry"/></div>}
                                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                                </CardContent>
                                {entry.tags && entry.tags.length > 0 && (
                                    <CardFooter className="flex-wrap gap-2">
                                        {entry.tags.map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                 )}
            </TabsContent>
            <TabsContent value="new" className="mt-6">
                <Card className="max-w-2xl mx-auto">
                    <form action={handleSave} ref={formRef}>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                               <BookHeart className="h-6 w-6 text-primary"/>
                               Create a New Journal Entry
                             </CardTitle>
                             <CardDescription>What's on your mind and in your heart today?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                               <Label htmlFor="title">Title</Label>
                               <Input id="title" name="title" placeholder="e.g., A special moment, a worry, a dream..." required/>
                            </div>
                             <div className="space-y-2">
                               <Label htmlFor="content">Your thoughts</Label>
                               <Textarea id="content" name="content" placeholder="Let it all flow..." rows={8} required/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                   <Label htmlFor="picture">Add a photo</Label>
                                   <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                     <label htmlFor="picture" className="cursor-pointer">
                                       <ImagePlus className="h-5 w-5"/>
                                       <span>Upload Image</span>
                                     </label>
                                   </Button>
                                   <Input id="picture" name="picture" type="file" className="hidden" />
                               </div>
                               <div className="space-y-2">
                                   <Label>Record a voice note</Label>
                                   <Button variant="outline" className="w-full justify-start gap-2" disabled>
                                       <Mic className="h-5 w-5"/>
                                       <span>Start Recording</span>
                                   </Button>
                               </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSaving} className="w-full">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Entry'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
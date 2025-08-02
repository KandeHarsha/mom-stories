'use client';

import React from 'react';
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
import { BookHeart, ImagePlus, Mic } from 'lucide-react';
import Image from 'next/image';

const mockEntries = [
  {
    id: 1,
    title: 'A tiny flutter',
    date: '3 days ago',
    content: 'Felt the first kick today. It was the most magical, surreal feeling. Just a tiny flutter, but it made everything so real. This little life inside me... it’s overwhelming in the best way.',
    image: 'https://placehold.co/600x400',
    imageHint: 'ultrasound baby',
    tags: ['pregnancy', 'milestone'],
  },
  {
    id: 2,
    title: 'Sleepless nights & sweet cuddles',
    date: '1 week ago',
    content: 'The nights are long, but the morning cuddles make it all worth it. Seeing that tiny smile... I wouldn\'t trade this exhaustion for anything. It feels like my heart has expanded to a size I never knew was possible.',
    tags: ['newborn', 'reflection'],
  },
  {
    id: 3,
    title: 'A letter to my future child',
    date: '2 weeks ago',
    content: 'My dearest one, as I write this, you are just a dream in my heart. I wonder who you will become, what you will love. Know that you are wanted, you are loved, and I am already so proud to be your mother.',
    tags: ['preparation', 'letter'],
  },
];


export default function JournalView() {
  return (
    <div>
        <div className="mb-6">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Your Private Journal</h2>
            <p className="text-muted-foreground mt-1">A safe space to capture every moment, thought, and feeling.</p>
        </div>
        <Tabs defaultValue="entries" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="entries">My Entries</TabsTrigger>
                <TabsTrigger value="new">New Entry</TabsTrigger>
            </TabsList>
            <TabsContent value="entries" className="mt-6">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mockEntries.map(entry => (
                        <Card key={entry.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{entry.title}</CardTitle>
                                <CardDescription>{entry.date}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {entry.image && <div className="mb-4 rounded-lg overflow-hidden"><Image src={entry.image} alt={entry.title} width={600} height={400} data-ai-hint={entry.imageHint}/></div>}
                                <p className="text-sm text-muted-foreground">{entry.content}</p>
                            </CardContent>
                             <CardFooter className="flex-wrap gap-2">
                                {entry.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            </TabsContent>
            <TabsContent value="new" className="mt-6">
                <Card className="max-w-2xl mx-auto">
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
                           <Input id="title" placeholder="e.g., A special moment, a worry, a dream..."/>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="content">Your thoughts</Label>
                           <Textarea id="content" placeholder="Let it all flow..." rows={8}/>
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
                               <Input id="picture" type="file" className="hidden" />
                           </div>
                           <div className="space-y-2">
                               <Label>Record a voice note</Label>
                               <Button variant="outline" className="w-full justify-start gap-2">
                                   <Mic className="h-5 w-5"/>
                                   <span>Start Recording</span>
                               </Button>
                           </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Save Entry</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

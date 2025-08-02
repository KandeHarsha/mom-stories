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
import { Button } from '@/components/ui/button';
import { Upload, Box } from 'lucide-react';
import Image from 'next/image';

const memories = [
  { id: 1, title: 'First Ultrasound', date: 'Jan 15, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'ultrasound baby' },
  { id: 2, title: 'Baby Shower Card', date: 'Mar 22, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'baby shower' },
  { id: 3, 'title': "Hospital Bracelet", date: 'Apr 05, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'hospital bracelet' },
  { id: 4, title: 'Coming Home Outfit', date: 'Apr 08, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'baby clothes' },
  { id: 5, title: 'First Footprints', date: 'Apr 10, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'baby footprints' },
  { id: 6, title: 'A letter from Grandma', date: 'May 01, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'handwritten letter' },
  { id: 7, title: 'First lock of hair', date: 'Oct 20, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'baby hair' },
  { id: 8, title: 'Favorite Onesie', date: 'Sep 15, 2024', imageUrl: 'https://placehold.co/400x400', imageHint: 'baby onesie' },
];

export default function MemoryBoxView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Box className="h-8 w-8 text-primary"/>
                Digital Memory Box
            </h2>
            <p className="text-muted-foreground mt-1">
                Your private, secure vault for every precious keepsake and milestone.
            </p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Upload className="mr-2 h-4 w-4" />
          Upload a Memory
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {memories.map((memory) => (
          <Card key={memory.id} className="overflow-hidden group">
            <CardContent className="p-0">
                <div className="aspect-square w-full overflow-hidden">
                    <Image
                        src={memory.imageUrl}
                        alt={memory.title}
                        width={400}
                        height={400}
                        data-ai-hint={memory.imageHint}
                        className="aspect-square object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </CardContent>
            <div className="p-4 border-t">
                <h3 className="font-semibold">{memory.title}</h3>
                <p className="text-xs text-muted-foreground">{memory.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

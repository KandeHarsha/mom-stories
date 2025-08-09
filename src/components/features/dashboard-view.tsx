// src/components/features/dashboard-view.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, HeartHandshake } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardView() {
  const router = useRouter();

  const handleSupportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const question = formData.get('question') as string;
    if (question.trim()) {
      router.push(`/ai-support?question=${encodeURIComponent(question)}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold font-headline tracking-tight">Welcome to Your Sacred Space</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mama's Embrace is your private companion through the beautiful, messy, and profound journey of motherhood.
          Here, you are safe, supported, and empowered.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-primary" />
              Gentle AI Support
            </CardTitle>
            <CardDescription>
              Ask questions and receive non-clinical, emotional guidance. What's on your mind?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question" className="sr-only">
                  Your question
                </Label>
                <Textarea
                  id="question"
                  name="question"
                  placeholder="e.g., How can I handle sleep deprivation? What are some good ways to bond with my baby?"
                  required
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">
                Ask Your Question
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Your question will be answered on the Gentle AI Support page. This is not a substitute for professional medical advice.
            </p>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <FeatureCard
            title="Private Journal"
            description="Chronicle your journey with text, voice, and photos."
            onClick={() => router.push('/journal?action=add')}
            buttonText="Add"
            buttonIcon={PlusCircle}
          />
          <FeatureCard
            title="Memory Box"
            description="Securely store precious photos, letters, and keepsakes."
            onClick={() => router.push('/memory-box?action=add')}
            buttonText="Add"
            buttonIcon={PlusCircle}
          />
           <FeatureCard
            title="Health Tracker"
            description="Track milestones for you and baby."
            onClick={() => router.push('/health')}
            buttonText="View"
            buttonIcon={HeartHandshake}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, onClick, buttonText, buttonIcon: ButtonIcon }: { title: string, description: string, onClick: () => void, buttonText: string, buttonIcon: React.ElementType }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="ghost" className="text-primary" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <ButtonIcon className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

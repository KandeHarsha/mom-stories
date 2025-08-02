'use client';
import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getJournalingPrompt } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ArrowRight } from 'lucide-react';
import type { View } from '@/app/page';

interface DashboardViewProps {
  setActiveView: (view: View) => void;
}

export default function DashboardView({ setActiveView }: DashboardViewProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState<string>('Your personalized prompt will appear here. ✨');

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await getJournalingPrompt(formData);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: result.error,
        });
      } else if (result.prompt) {
        setPrompt(result.prompt);
      }
    });
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
              <Wand2 className="h-6 w-6 text-primary" />
              Personalized Journaling Prompt
            </CardTitle>
            <CardDescription>
              Feeling stuck? Let's find a starting point for your thoughts today.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="stage">What stage of motherhood are you in?</Label>
                <Select name="stageOfMotherhood" required>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select your current stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparation">Preparation / Trying to Conceive</SelectItem>
                    <SelectItem value="pregnancy">Pregnancy</SelectItem>
                    <SelectItem value="fourth-trimester">Fourth Trimester (0-3 months)</SelectItem>
                    <SelectItem value="beyond">Beyond (Parenting)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experiences">Describe any recent experiences or feelings.</Label>
                <Textarea
                  id="experiences"
                  name="recentExperiences"
                  placeholder="e.g., feeling the first kick, a sleepless night, a moment of pure joy..."
                  required
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Create My Prompt'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-secondary/50 w-full">
              {prompt}
            </p>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <FeatureCard
            title="Private Journal"
            description="Chronicle your journey with text, voice, and photos."
            onClick={() => setActiveView('journal')}
          />
          <FeatureCard
            title="Gentle AI Support"
            description="Ask questions and receive non-clinical, emotional guidance."
            onClick={() => setActiveView('ai-support')}
          />
          <FeatureCard
            title="Memory Box"
            description="Securely store precious photos, letters, and keepsakes."
            onClick={() => setActiveView('memory-box')}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, onClick }: { title: string, description: string, onClick: () => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="ghost" className="text-primary">
          Explore <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

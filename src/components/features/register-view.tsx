// src/components/features/register-view.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function RegisterView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phase }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to register');
        }

        toast({
          title: 'Registration Successful',
          description: "Welcome! You can now log in.",
        });
        
        router.push('/login');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: errorMessage,
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to start your journey.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            {/* <div className="grid gap-2">
              <Label htmlFor="phase">Phase</Label>
              <select
                id="phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                disabled={isPending}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select a phase (optional)</option>
                <option value="preparation">Preparation</option>
                <option value="pregnancy">Pregnancy</option>
                <option value="fourth_trimester">Fourth Trimester</option>
                <option value="beyond">Beyond</option>
              </select>
            </div> */}
            <div className="grid gap-2">
              <Label htmlFor="phase">Phase</Label>
              <Select
                onValueChange={setPhase}
                value={phase}
                disabled={isPending}
              >
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Select a phase (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="pregnancy">Pregnancy</SelectItem>
                  <SelectItem value="fourth_trimester">Fourth Trimester</SelectItem>
                  <SelectItem value="beyond">Beyond</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign up
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

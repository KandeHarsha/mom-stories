
'use client';

import React, { useTransition } from 'react';
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
import { HeartHandshake, Loader2 } from 'lucide-react';
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { signUpUserAction } from '../actions';

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await signUpUserAction(formData);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created. Please log in.',
        });
        // You would typically redirect the user here, e.g., router.push('/login')
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <form action={handleSubmit}>
          <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-2 mb-4">
                <HeartHandshake className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">Mama's Embrace</CardTitle>
            </div>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
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


// src/components/features/login-view.tsx
'use client';

import React, { useEffect, useState, useTransition } from 'react';
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
import { useUser } from '@/context/user-context';

export default function LoginView() {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [isPending, startTransition] = useTransition();
  // const { toast } = useToast();
  // const router = useRouter();
  // const { login } = useUser();

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   startTransition(async () => {
  //     try {
  //       const result = await login(email, password);
        
  //       if (result.error) {
  //          throw new Error(result.error);
  //       }

  //       toast({
  //         title: 'Login Successful',
  //         description: "Welcome back!",
  //       });
        
  //       // Hard refresh to re-evaluate middleware and root layout
  //       window.location.href = '/dashboard';

  //     } catch (error) {
  //       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  //       toast({
  //         variant: 'destructive',
  //         title: 'Login Failed',
  //         description: errorMessage,
  //       });
  //     }
  //   });
  // };


  useEffect(() => {
    if (typeof window !== 'undefined' && window.LoginRadiusSDK) {
      var commonOptions = {
        apiKey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY,
        sott: process.env.NEXT_PUBLIC_LOGINRADIUS_SOTT,
        callbackUrl: window.location.origin,
        resetPasswordUrl: window.location.origin,
        localization: true,
        OtpLength: 5,
        OtpType: 'ALPHANUMERICONLYCAPSLETTER',
      };
      var LRObject = new window.LoginRadiusSDK(commonOptions);
      LRObject.init('auth', {
        container: 'login-container',
        isForgotpassword: false,
        onSuccess: function (response: any) { console.log('login successful:', response); },
        onError: function (error: any) { console.error('login error:', error); },
      });
    }
  }, []);

  return <div id="login-container" />;


  // return (
  //   <div className="flex items-center justify-center min-h-screen bg-muted/40">
  //     <Card className="w-full max-w-sm">
  //       <CardHeader>
  //         <CardTitle className="text-2xl">Login</CardTitle>
  //         <CardDescription>
  //           Enter your email below to login to your account.
  //         </CardDescription>
  //       </CardHeader>
  //       <form onSubmit={handleLogin}>
  //         <CardContent className="grid gap-4">
  //           <div className="grid gap-2">
  //             <Label htmlFor="email">Email</Label>
  //             <Input
  //               id="email"
  //               type="email"
  //               placeholder="m@example.com"
  //               required
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //               disabled={isPending}
  //             />
  //           </div>
  //           <div className="grid gap-2">
  //             <Label htmlFor="password">Password</Label>
  //             <Input
  //               id="password"
  //               type="password"
  //               required
  //               value={password}
  //               onChange={(e) => setPassword(e.target.value)}
  //               disabled={isPending}
  //             />
  //           </div>
  //         </CardContent>
  //         <CardFooter className="flex flex-col gap-4">
  //           <Button className="w-full" type="submit" disabled={isPending}>
  //             {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  //             Sign in
  //           </Button>
  //           <div className="text-center text-sm">
  //             Don&apos;t have an account?{" "}
  //             <Link href="/register" className="underline">
  //               Sign up
  //             </Link>
  //           </div>
  //         </CardFooter>
  //       </form>
  //     </Card>
  //   </div>
  // );
}

// src/components/features/login-view.tsx
'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/services/user-service';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginView() {
  const { login } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.LoginRadiusSDK) {
      var commonOptions = {
        apiKey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY,
        sott: process.env.NEXT_PUBLIC_LOGINRADIUS_SOTT,
        callbackUrl: window.location.origin,
        resetPasswordUrl: window.location.origin,
      };

      var LRObject = new window.LoginRadiusSDK(commonOptions);

      LRObject.init('auth', {
        container: 'login-container',
        isForgotpassword: false,
        onSuccess: async function (response: { access_token: string, Profile: UserProfile }) { 
          try {
            const result = await login(response);
            if (result.error) {
              throw new Error(result.error);
            }
            toast({
              title: 'Login Successful',
              description: "Welcome back!",
            });
            // Hard refresh to re-evaluate middleware and root layout
            window.location.href = '/dashboard';
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: errorMessage,
            });
          }
        },
        onError: function (errors: any) { 
          console.error('login error:', errors); 
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: errors[0]?.Description || 'An unexpected error occurred. Please try again.',
          });
        },
      });
    }
  }, [login, toast, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
            <CardContent className="p-6">
                <div id="login-container" />
            </CardContent>
        </Card>
    </div>
  );
}
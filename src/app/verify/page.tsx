'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const vtoken = searchParams.get('vtoken');
    const vtype = searchParams.get('vtype');

    if (!vtoken || !vtype) {
      setStatus('error');
      setMessage('Invalid verification link. Missing required parameters.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?vtoken=${vtoken}&vtype=${vtype}`);
        const data = await response.json();
        
        console.log('Verify response:', { status: response.status, ok: response.ok, data });

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Email verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Verify error:', error);
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-600" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/register')} 
                className="w-full"
              >
                Back to Registration
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

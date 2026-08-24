'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, TriangleAlert } from 'lucide-react';

type Status = 'checkingSession' | 'redirectingToLogin' | 'confirm' | 'deleting' | 'success' | 'error';

function DeleteAccountConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('checkingSession');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid deletion link. Missing confirmation token.');
      return;
    }

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/get-session');
        const data = await response.json().catch(() => null);
        if (data?.session) {
          setStatus('confirm');
        } else {
          setStatus('redirectingToLogin');
          const callbackUrl = `/delete-account/confirm?token=${token}`;
          router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      } catch {
        setStatus('redirectingToLogin');
        const callbackUrl = `/delete-account/confirm?token=${token}`;
        router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
    };

    checkSession();
  }, [token, router]);

  const handleConfirmDelete = async () => {
    setStatus('deleting');
    setErrorMessage('');
    try {
      const response = await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete account.');
      }
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to delete account. The link may have expired.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {(status === 'checkingSession' || status === 'redirectingToLogin' || status === 'deleting') && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'confirm' && (
              <TriangleAlert className="h-16 w-16 text-destructive" />
            )}
            {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-600" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'checkingSession' && 'Checking Your Session'}
            {status === 'redirectingToLogin' && 'Redirecting to Sign In'}
            {status === 'confirm' && 'Delete Your Account'}
            {status === 'deleting' && 'Deleting Your Account'}
            {status === 'success' && 'Account Deleted'}
            {status === 'error' && 'Something Went Wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'redirectingToLogin' && (
            <p className="text-center text-muted-foreground">
              Sign in to verify it&apos;s really you before we delete your account.
            </p>
          )}

          {status === 'confirm' && (
            <>
              <p className="text-center text-muted-foreground">
                This will permanently delete your account and all associated data (journal entries,
                children&apos;s profiles, memories, and more). This cannot be undone.
              </p>
              {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
              <Button variant="destructive" className="w-full" onClick={handleConfirmDelete}>
                Permanently Delete My Account
              </Button>
            </>
          )}

          {status === 'success' && (
            <p className="text-center text-muted-foreground">
              Your account and all associated data have been permanently deleted.
            </p>
          )}

          {status === 'error' && (
            <p className="text-center text-muted-foreground">{errorMessage}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeleteAccountConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <DeleteAccountConfirmContent />
    </Suspense>
  );
}

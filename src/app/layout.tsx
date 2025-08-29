
'use client'; // Required to use client-side hooks like useState and useEffect

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/app-layout';

// We can't use Next/Head's metadata export in a client component.
// We'll manage the title directly in the <head> tag.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This check runs only on the client-side
    const token = localStorage.getItem('session_token');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    // Return a loading state to prevent flash of incorrect content
    return (
       <html lang="en" suppressHydrationWarning>
        <head>
          <title>Mama's Embrace</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased">
          <div className="flex h-screen items-center justify-center">
            Loading...
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <title>Mama's Embrace</title>
        <meta name="description" content="An AI-powered companion for mothers at every stage." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {isLoggedIn ? (
          <AppLayout>
            {children}
          </AppLayout>
        ) : (
          <>
            {children}
          </>
        )}
        <Toaster />
      </body>
    </html>
  );
}

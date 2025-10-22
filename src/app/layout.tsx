
// src/app/layout.tsx
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/user-context';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Mom Stories',
  description: 'An AI-powered companion for mothers at every stage.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://auth-dev.lrinternal.com/LoginRadiusV3.css" />
      </head>
      <body className="font-body antialiased">
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
        <Script src="https://auth-dev.lrinternal.com/LoginRadiusV3.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}

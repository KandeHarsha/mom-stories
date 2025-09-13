
// src/app/layout.tsx
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/user-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <title>Mom Stories</title>
        <meta name="description" content="An AI-powered companion for mothers at every stage." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://auth-dev.lrinternal.com/LoginRadiusV3.css" />
        <script src="https://auth-dev.lrinternal.com/LoginRadiusV3.js"></script>
      </head>
      <body className="font-body antialiased">
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}

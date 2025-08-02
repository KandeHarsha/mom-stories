'use client';

import React, { type ReactNode } from 'react';
import type { View } from '@/app/page';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import {
  Baby,
  BookHeart,
  HeartHandshake,
  LayoutDashboard,
  Box,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'journal', label: 'Private Journal', icon: BookHeart },
  { id: 'memory-box', label: 'Memory Box', icon: Box },
  { id: 'ai-support', label: 'Gentle AI Support', icon: HeartHandshake },
  { id: 'health', label: 'Health Tracker', icon: Baby },
];

export default function AppLayout({ children, activeView, setActiveView }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-headline font-semibold text-lg">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span>Mama's Embrace</span>
          </div>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? 'default' : 'ghost'}
                className="justify-start gap-3 px-3 my-1"
                onClick={() => setActiveView(item.id as View)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           {/* Mobile Menu can be added here */}
           <div className="sm:hidden">
            <h1 className="text-lg font-bold tracking-tight font-headline">Mama's Embrace</h1>
           </div>
           <div className="ml-auto flex items-center space-x-4">
             <AppHeader />
           </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  );
}


// src/components/features/profile-view.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useUser } from '@/context/user-context';

const motherhoodStages = {
    'preparation': 'Preparation / Trying to Conceive',
    'pregnancy': 'Pregnancy',
    'fourth_trimester': 'Fourth Trimester (0-3 months)',
    'beyond': 'Beyond (Parenting)',
    '': 'Not specified'
};

export default function ProfileView() {
    const router = useRouter();
    const { user, isLoading } = useUser();

    // The user object from context might have a different shape for email, let's normalize it.
    const email = user?.Email?.[0]?.Value || user?.email || 'No email found';

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <User className="h-8 w-8 text-primary"/>
                    {isLoading ? <Skeleton className="h-8 w-48" /> : `${user?.FirstName || user?.name || 'User'}'s Profile`}
                </h2>
                <p className="text-muted-foreground mt-1">Manage your personal information and preferences in settings.</p>
            </div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Your Details</CardTitle>
                    <CardDescription>
                        This is your personal information. You can update it on the settings page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ) : user ? (
                        <div className="space-y-4 pt-6">
                            <div>
                                <Label>Your Name</Label>
                                <p className="text-md flex items-center gap-2 text-foreground p-2 bg-secondary rounded-md">
                                  <User className="h-4 w-4 text-muted-foreground"/>
                                  {user.FirstName || user.name}
                                </p>
                            </div>
                            <div>
                                <Label>Email Address</Label>
                                <p className="text-md flex items-center gap-2 text-foreground p-2 bg-secondary rounded-md">
                                  <Mail className="h-4 w-4 text-muted-foreground"/>
                                  {email}
                                </p>
                            </div>
                            <div>
                                <Label>Your Current Stage</Label>
                                 <p className="text-md flex items-center gap-2 text-foreground p-2 bg-secondary rounded-md">
                                  <Heart className="h-4 w-4 text-muted-foreground"/>
                                  {motherhoodStages[user.phase as keyof typeof motherhoodStages] || 'Not specified'}
                                </p>
                            </div>
                             <Button onClick={() => router.push('/settings')}>
                                Go to Settings to Update
                            </Button>
                        </div>
                    ) : (
                        <p className="pt-6">Could not load profile. Please try again later.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

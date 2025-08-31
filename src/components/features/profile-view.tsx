// src/components/features/profile-view.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

const motherhoodStages = {
    'preparation': 'Preparation / Trying to Conceive',
    'pregnancy': 'Pregnancy',
    'fourth-trimester': 'Fourth Trimester (0-3 months)',
    'beyond': 'Beyond (Parenting)'
};

export default function ProfileView() {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const profileStr = localStorage.getItem('user_profile');
        if (profileStr) {
            setUserProfile(JSON.parse(profileStr));
        }
        setIsLoading(false);
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <User className="h-8 w-8 text-primary"/>
                    {isLoading ? <Skeleton className="h-8 w-48" /> : `${userProfile?.FirstName || 'User'}'s Profile`}
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
                    ) : userProfile ? (
                        <div className="space-y-4 pt-6">
                            <div>
                                <Label>Your Name</Label>
                                <p className="text-md flex items-center gap-2 text-foreground p-2 bg-secondary rounded-md">
                                  <User className="h-4 w-4 text-muted-foreground"/>
                                  {userProfile.FirstName}
                                </p>
                            </div>
                            <div>
                                <Label>Email Address</Label>
                                <p className="text-md flex items-center gap-2 text-foreground p-2 bg-secondary rounded-md">
                                  <Mail className="h-4 w-4 text-muted-foreground"/>
                                  {userProfile.Email[0].Value}
                                </p>
                            </div>
                            <div>
                                <Label>Your Current Stage</Label>
                                 <p className="text-md flex items-center gap-2 text-foreground p-2 bg-secondary rounded-md">
                                  <Heart className="h-4 w-4 text-muted-foreground"/>
                                  {motherhoodStages[userProfile.phase as keyof typeof motherhoodStages] || 'Not specified'}
                                </p>
                            </div>
                             <Button onClick={() => router.push('/settings')}>
                                Go to Settings to Update
                            </Button>
                        </div>
                    ) : (
                        <p className="pt-6">Could not load profile. Please log in again.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

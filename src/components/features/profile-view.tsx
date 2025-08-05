
// src/components/features/profile-view.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserProfileAction, updateUserPhaseAction } from '@/app/actions';
import { Loader2, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const motherhoodStages = [
    { value: 'preparation', label: 'Preparation / Trying to Conceive' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'fourth-trimester', label: 'Fourth Trimester (0-3 months)' },
    { value: 'beyond', label: 'Beyond (Parenting)' },
];

export default function ProfileView() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isLoading, startLoadingTransition] = useTransition();
    const [currentPhase, setCurrentPhase] = useState<string>('');
    const [selectedPhase, setSelectedPhase] = useState<string>('');

    useEffect(() => {
        startLoadingTransition(async () => {
            try {
                const profile = await getUserProfileAction();
                if (profile && profile.phase) {
                    setCurrentPhase(profile.phase);
                    setSelectedPhase(profile.phase);
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load your profile.',
                });
            }
        });
    }, [toast]);

    const handleSave = () => {
        if (!selectedPhase || selectedPhase === currentPhase) return;
        startTransition(async () => {
            const result = await updateUserPhaseAction(selectedPhase);
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Oh no! Something went wrong.',
                    description: result.error,
                });
            } else if (result.success) {
                setCurrentPhase(selectedPhase);
                toast({
                    title: 'Profile Updated!',
                    description: 'Your stage of motherhood has been updated.',
                });
            }
        });
    };

    const getPhaseLabel = (value: string) => {
        return motherhoodStages.find(s => s.value === value)?.label || 'Not set';
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <User className="h-8 w-8 text-primary"/>
                    Your Profile
                </h2>
                <p className="text-muted-foreground mt-1">Manage your personal information and preferences.</p>
            </div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Stage of Motherhood</CardTitle>
                    <CardDescription>
                        Keeping this up-to-date helps us personalize your experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Label>Current Stage</Label>
                            <Skeleton className="h-10 w-full" />
                        </div>

                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label>Current Stage</Label>
                                <p className="text-lg font-semibold text-primary">{getPhaseLabel(currentPhase)}</p>
                            </div>
                            <div>
                                <Label htmlFor="stage">Update Your Stage</Label>
                                <Select onValueChange={setSelectedPhase} defaultValue={currentPhase}>
                                    <SelectTrigger id="stage">
                                        <SelectValue placeholder="Select your current stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {motherhoodStages.map(stage => (
                                            <SelectItem key={stage.value} value={stage.value}>
                                                {stage.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <Button onClick={handleSave} disabled={isPending || selectedPhase === currentPhase}>
                                {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                                ) : (
                                'Save Changes'
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

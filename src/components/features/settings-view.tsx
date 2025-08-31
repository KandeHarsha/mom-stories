// src/components/features/settings-view.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserProfileAction, updateUserProfileAction } from '@/app/actions';
import { Loader2, Settings, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { type UserProfile } from '@/services/user-service';
import { useUser } from '@/context/user-context';

const motherhoodStages = [
    { value: 'preparation', label: 'Preparation / Trying to Conceive' },
    { value: 'pregnancy', label: 'Pregnancy' },
    { value: 'fourth-trimester', label: 'Fourth Trimester (0-3 months)' },
    { value: 'beyond', label: 'Beyond (Parenting)' },
];

export default function SettingsView() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const { user, isLoading: isUserLoading, setUser } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [editedName, setEditedName] = useState('');
    const [selectedPhase, setSelectedPhase] = useState('');

     useEffect(() => {
        if (user) {
            setProfile(user);
            setEditedName(user.FirstName || user.name || '');
            setSelectedPhase(user.phase || '');
        }
    }, [user]);

    const handleSave = () => {
        if (!profile || !user || (editedName === (user.FirstName || user.name) && selectedPhase === user.phase)) return;
        
        startTransition(async () => {
            const result = await updateUserProfileAction({name: editedName, phase: selectedPhase, userId: user.Uid });
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Oh no! Something went wrong.',
                    description: result.error,
                });
            } else if (result.success) {
                const updatedProfile = { ...user, FirstName: editedName, name: editedName, phase: selectedPhase as any };
                setUser(updatedProfile);
                setProfile(updatedProfile);
                toast({
                    title: 'Profile Updated!',
                    description: 'Your profile details have been updated.',
                });
            }
        });
    };

    const hasChanges = profile ? (editedName.trim() !== (profile.FirstName || profile.name) || selectedPhase !== profile.phase) && editedName.trim().length > 0 : false;
    const isLoading = isUserLoading || !profile;
    const email = user?.Email?.[0]?.Value || user?.email || 'No email found';


    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8 text-primary"/>
                    Settings
                </h2>
                <p className="text-muted-foreground mt-1">Manage your personal information and preferences.</p>
            </div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Update Your Details</CardTitle>
                    <CardDescription>
                        Keeping this up-to-date helps us personalize your experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4 pt-6">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : profile ? (
                        <div className="space-y-4 pt-6">
                            <div>
                                <Label htmlFor="name">Your Name</Label>
                                <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                            </div>
                            <div>
                                <Label>Email Address (read-only)</Label>
                                <p className="text-md flex items-center gap-2 text-muted-foreground p-2 bg-secondary rounded-md h-10">
                                  <Mail className="h-4 w-4"/>
                                  {email}
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="stage">Update Your Stage</Label>
                                <Select onValueChange={setSelectedPhase} value={selectedPhase}>
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
                             <Button onClick={handleSave} disabled={isPending || !hasChanges}>
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
                    ) : (
                        <p>Could not load profile.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

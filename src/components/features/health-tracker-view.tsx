
'use client';
import React, { useState, useEffect, useTransition, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Baby, Smile, Loader2, ImagePlus, X, Paperclip, View, PlusCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import type { MergedVaccination } from '@/services/vaccination-service';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Image from 'next/image';
import { useUser } from '@/context/user-context';
import { type BabyProfile, createBabyProfile, getBabyProfile } from '@/services/baby-service';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';


const babyChartConfig = {
  weight: { label: 'Weight (kg)', color: 'hsl(var(--primary))' },
  length: { label: 'Height (cm)', color: 'hsl(var(--accent-foreground))' },
};

const momSleepData = [
  { day: 'Mon', hours: 5 },
  { day: 'Tue', hours: 6 },
  { day: 'Wed', hours: 4.5 },
  { day: 'Thu', hours: 7 },
  { day: 'Fri', hours: 5.5 },
  { day: 'Sat', hours: 8 },
  { day: 'Sun', hours: 6 },
];

const momMoodData = [
    { day: 'Mon', mood: 3 },
    { day: 'Tue', mood: 4 },
    { day: 'Wed', mood: 2 },
    { day: 'Thu', mood: 5 },
    { day: 'Fri', mood: 3 },
    { day: 'Sat', mood: 5 },
    { day: 'Sun', mood: 4 },
];

const momChartConfig = {
    sleep: { label: 'Sleep (hours)', color: 'hsl(var(--chart-1))' },
    mood: { label: 'Mood (1-5)', color: 'hsl(var(--chart-2))' }
}

export default function HealthTrackerView() {
  const { user, updateUser } = useUser();
  const [vaccinations, setVaccinations] = useState<MergedVaccination[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const { toast } = useToast();
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedVax, setSelectedVax] = useState<MergedVaccination | null>(null);
  const [vaxImageFile, setVaxImageFile] = useState<File | null>(null);
  const [vaxImagePreview, setVaxImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [isBabyProfileLoading, startBabyProfileLoading] = useTransition();
  const [isBabyFormOpen, setIsBabyFormOpen] = useState(false);
  const [isSavingBaby, startSavingBabyTransition] = useTransition();

  const [babyName, setBabyName] = useState('');
  const [babyBirthday, setBabyBirthday] = useState<Date>();
  const [babyWeight, setBabyWeight] = useState('');
  const [babyHeight, setBabyHeight] = useState('');
  const [babyGender, setBabyGender] = useState<'Male' | 'Female' | 'Other'>();

  const [isMeasurementFormOpen, setIsMeasurementFormOpen] = useState(false);
  const [isSavingMeasurement, startSavingMeasurementTransition] = useTransition();
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [measurementDate, setMeasurementDate] = useState<Date | undefined>(new Date());
  const [useBirthdayDate, setUseBirthdayDate] = useState(false);


  const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('session_token');
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  useEffect(() => {
    if (!user) return;
    
    startBabyProfileLoading(async () => {
      if (user.babyId) {
        try {
          const profile = await getBabyProfile(user.babyId);
          setBabyProfile(profile);
          setIsBabyFormOpen(false);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error fetching baby profile', description: (error as Error).message });
          setIsBabyFormOpen(true);
        }
      } else {
        // No babyId, so we need to prompt the user to create one
        setIsBabyFormOpen(true);
      }
    });

    startLoadingTransition(async () => {
      try {
        const response = await fetch('/api/vaccinations', {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch vaccinations');
        }
        const data = await response.json();
        setVaccinations(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, toast]);

  const handleBabyProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !babyName || !babyBirthday || !babyWeight || !babyHeight || !babyGender) {
      toast({ variant: 'destructive', title: 'Please fill out all fields.' });
      return;
    }

    startSavingBabyTransition(async () => {
      try {
        const newBabyId = await createBabyProfile({
          name: babyName,
          birthday: babyBirthday,
          parentId: user.Uid,
          birthWeight: parseFloat(babyWeight),
          birthHeight: parseFloat(babyHeight),
          gender: babyGender,
        });

        if (user) {
          const updatedUser = { ...user, babyId: newBabyId };
          updateUser(updatedUser);
        }
        
        const profile = await getBabyProfile(newBabyId);
        setBabyProfile(profile);
        
        setIsBabyFormOpen(false);
        toast({ title: 'Baby Profile Created!', description: `${babyName}'s profile is ready.` });

      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Error creating profile',
          description: (error as Error).message,
        });
      }
    });
  };

  const handleMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyProfile || (!newWeight && !newHeight)) {
      toast({ variant: 'destructive', title: 'Please enter at least one measurement.' });
      return;
    }

    const dateToSend = useBirthdayDate ? new Date(babyProfile.birthday) : measurementDate;
    if (!dateToSend) {
      toast({ variant: 'destructive', title: 'Please select a date.' });
      return;
    }
    
    startSavingMeasurementTransition(async () => {
      try {
        const response = await fetch(`/api/babies/${babyProfile.id}/measurements`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            weight: newWeight,
            height: newHeight,
            date: dateToSend.toISOString(),
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to add measurement');
        }

        const { profile: updatedProfile } = await response.json();
        setBabyProfile(updatedProfile);
        
        toast({ title: 'Measurement Saved!' });
        setIsMeasurementFormOpen(false);
        setNewWeight('');
        setNewHeight('');
        setMeasurementDate(new Date());
        setUseBirthdayDate(false);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error saving measurement',
          description: (error as Error).message,
        });
      }
    });
  }

  const babyGrowthData = babyProfile
    ? (() => {
        // Preprocess height entries into a map keyed by toDateString
        const heightByDateString = new Map<string, { date: string, value: number }>();
        babyProfile.height.forEach(h => {
          heightByDateString.set(new Date(h.date).toDateString(), h);
        });
        return babyProfile.weight.map((w, i) => {
          const wDateString = new Date(w.date).toDateString();
          const matchingHeight = heightByDateString.get(wDateString);
          return {
            date: format(new Date(w.date), 'MMM d, yyyy'),
            weight: w.value,
            length: matchingHeight ? matchingHeight.value : null,
          }
        });
      })()
    : [];

  const handleVaxStatusChange = (vax: MergedVaccination, checked: boolean) => {
    if (checked) {
      setSelectedVax(vax);
      setIsConfirming(true);
    } else {
      // If unchecking, update immediately without a photo
      updateStatus(vax.id, 0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVaxImageFile(file);
    if (vaxImagePreview) {
      URL.revokeObjectURL(vaxImagePreview);
    }
    if (file) {
      setVaxImagePreview(URL.createObjectURL(file));
    } else {
      setVaxImagePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setVaxImageFile(null);
    if (vaxImagePreview) {
      URL.revokeObjectURL(vaxImagePreview);
      setVaxImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetDialog = () => {
    setIsConfirming(false);
    setSelectedVax(null);
    handleRemoveFile();
  }

  const handleConfirmUpdate = () => {
    if (!selectedVax) return;
    updateStatus(selectedVax.id, 1, vaxImageFile);
  };
  
  const updateStatus = (id: string, status: 0 | 1, imageFile: File | null = null) => {
    startUpdateTransition(async () => {
        const formData = new FormData();
        formData.append('status', String(status));
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch(`/api/vaccinations/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(false), // Not JSON content type
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to update vaccination status');
            }
            
            const result = await response.json();

            setVaccinations(vaccinations.map((v) =>
                v.id === id ? { ...v, status, imageUrl: result.imageUrl || v.imageUrl } : v
            ));

            toast({
                title: 'Status Updated',
                description: 'Vaccination status has been saved.',
            });
            resetDialog();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: (error as Error).message,
            });
        }
    });
  }

  useEffect(() => {
    if (useBirthdayDate && babyProfile) {
      setMeasurementDate(new Date(babyProfile.birthday));
    } else {
      setMeasurementDate(new Date());
    }
  }, [useBirthdayDate, babyProfile]);

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Baby className="h-8 w-8 text-primary"/>
                Growth & Health Tools
            </h2>
            <p className="text-muted-foreground mt-1">
                Keep track of important milestones and health data for you and your baby.
            </p>
        </div>
        <Tabs defaultValue="growth" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="growth">Baby Growth</TabsTrigger>
                <TabsTrigger value="vaccinations">Baby Vaccinations</TabsTrigger>
                <TabsTrigger value="mom">Mom's Wellness</TabsTrigger>
            </TabsList>
            <TabsContent value="growth" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{babyProfile ? `${babyProfile.name}'s Growth` : "Baby's Growth Milestones"}</CardTitle>
                        <CardDescription>Visualizing weight and height over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isBabyProfileLoading ? <Skeleton className="h-[400px] w-full" /> : (
                        <ChartContainer config={babyChartConfig} className="h-[400px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={babyGrowthData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis yAxisId="left" orientation="left" stroke={babyChartConfig.weight.color} />
                                    <YAxis yAxisId="right" orientation="right" stroke={babyChartConfig.length.color} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="weight" name="Weight (kg)" fill={babyChartConfig.weight.color} radius={4} yAxisId="left" />
                                    <Bar dataKey="length" name="Height (cm)" fill={babyChartConfig.length.color} radius={4} yAxisId="right" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                      )}
                    </CardContent>
                    <CardFooter>
                       {babyProfile && (
                           <Button onClick={() => setIsMeasurementFormOpen(true)}>
                               <PlusCircle className="mr-2 h-4 w-4" />
                               Add Measurement
                           </Button>
                       )}
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="vaccinations" className="mt-6">
                <Card>
                    <CardHeader>
                         <CardTitle>Vaccination Schedule</CardTitle>
                         <CardDescription>A simplified tracker for your baby's immunizations. Always consult your pediatrician for official schedules.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                           {vaccinations.map((vax) => (
                             <AccordionItem value={`item-${vax.id}`} key={vax.id}>
                               <AccordionTrigger className="hover:no-underline">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="text-left">
                                       <div className="font-semibold">{vax.name}</div>
                                       <div className="text-sm text-muted-foreground">{`Recommended Age: ${vax.age} (Dose: ${vax.dose})`}</div>
                                   </div>
                                   <Badge variant={vax.status === 1 ? 'default' : 'secondary'} className={cn("mr-4", vax.status === 1 ? "bg-green-600 hover:bg-green-700" : "")}>{vax.status === 1 ? 'Complete' : 'Pending'}</Badge>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent>
                                 <p className="text-muted-foreground mb-4">{vax.description}</p>
                                 {vax.imageUrl && (
                                    <Button variant="outline" size="sm" className="mb-4" onClick={() => setViewingImageUrl(vax.imageUrl!)}>
                                      <View className="mr-2 h-4 w-4" />
                                      View Document
                                    </Button>
                                  )}
                                 <div className="flex items-center space-x-2">
                                     <Checkbox
                                       id={`vax-check-${vax.id}`}
                                       checked={vax.status === 1}
                                       onCheckedChange={(checked) => handleVaxStatusChange(vax, checked as boolean)}
                                       aria-label={`Mark ${vax.name} as ${vax.status === 1 ? 'incomplete' : 'complete'}`}
                                       disabled={isUpdating}
                                     />
                                     <Label htmlFor={`vax-check-${vax.id}`} className="cursor-pointer">
                                        {vax.status === 1 ? 'Mark as incomplete' : 'Mark as complete'}
                                     </Label>
                                     {isUpdating && selectedVax?.id === vax.id && <Loader2 className="h-4 w-4 animate-spin" />}
                                 </div>
                               </AccordionContent>
                             </AccordionItem>
                           ))}
                         </Accordion>
                      )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="mom" className="mt-6">
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Sleep Pattern</CardTitle>
                            <CardDescription>Tracking your hours of sleep over the past week.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={momChartConfig} className="h-[300px] w-full">
                                <BarChart data={momSleepData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="hours" name="Hours" fill={momChartConfig.sleep.color} radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Weekly Mood Tracker</CardTitle>
                            <CardDescription>Tracking your mood on a scale of 1 to 5.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={momChartConfig} className="h-[300px] w-full">
                                <BarChart data={momMoodData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis domain={[0, 5]}/>
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="mood" name="Mood" fill={momChartConfig.mood.color} radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
        
         <Dialog open={isConfirming} onOpenChange={(open) => !open && resetDialog()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Confirm Vaccination</DialogTitle>
                    <DialogDescription>
                        You are marking "{selectedVax?.name}" as complete. You can optionally upload a photo of the vaccination record.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 flex-grow overflow-y-auto pr-4 -mr-4">
                    <div className="space-y-2">
                        <Label htmlFor="vax-image-upload">Upload Record (Optional)</Label>
                         <Button variant="outline" className="w-full justify-start gap-2" asChild>
                            <label htmlFor="vax-image-upload" className="cursor-pointer">
                            <ImagePlus className="h-5 w-5"/>
                            <span>{vaxImageFile ? 'Change photo' : 'Upload photo'}</span>
                            </label>
                        </Button>
                        <Input id="vax-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                    </div>

                    {vaxImagePreview && vaxImageFile && (
                        <div className="space-y-2">
                            <Label>Photo Preview</Label>
                            <div className="relative group">
                                <Image src={vaxImagePreview} alt="Preview" width={200} height={200} className="rounded-lg w-full h-auto object-cover"/>
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" onClick={handleRemoveFile}>
                                <X className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md p-2">
                                <Paperclip className="h-4 w-4"/>
                                <span>{vaxImageFile.name}</span>
                                <span className="ml-auto">{Math.round(vaxImageFile.size / 1024)} KB</span>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="pt-4 flex-shrink-0">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={resetDialog}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleConfirmUpdate} disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={!!viewingImageUrl} onOpenChange={() => setViewingImageUrl(null)}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[90vh]">
                 <DialogHeader>
                    <DialogTitle>Vaccination Document</DialogTitle>
                </DialogHeader>
                <div className="relative h-[75vh]">
                    <Image src={viewingImageUrl || ''} alt="Vaccination Document" layout="fill" objectFit="contain" className="rounded-md" />
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isBabyFormOpen} onOpenChange={setIsBabyFormOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Baby's Profile</DialogTitle>
                    <DialogDescription>
                        Let's get your baby's growth tracking started. This can be updated later.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBabyProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="baby-name">Baby's Name</Label>
                        <Input id="baby-name" value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="e.g. Leo" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="baby-birthday">Birthday</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !babyBirthday && "text-muted-foreground"
                                    )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {babyBirthday ? format(babyBirthday, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={babyBirthday}
                                onSelect={setBabyBirthday}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <RadioGroup 
                            required 
                            className="flex items-center gap-4" 
                            onValueChange={(value: 'Male' | 'Female' | 'Other') => setBabyGender(value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Male" id="male" />
                                <Label htmlFor="male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Female" id="female" />
                                <Label htmlFor="female">Female</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Other" id="other" />
                                <Label htmlFor="other">Other</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="baby-weight">Weight at Birth (kg)</Label>
                            <Input id="baby-weight" type="number" value={babyWeight} onChange={(e) => setBabyWeight(e.target.value)} placeholder="e.g. 3.4" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="baby-height">Height at Birth (cm)</Label>
                            <Input id="baby-height" type="number" value={babyHeight} onChange={(e) => setBabyHeight(e.target.value)} placeholder="e.g. 50" required />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button type="submit" disabled={isSavingBaby}>
                            {isSavingBaby && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Profile
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={isMeasurementFormOpen} onOpenChange={
          (isOpen) => {
            setIsMeasurementFormOpen(isOpen);
            if (!isOpen) {
              setUseBirthdayDate(false); // Reset on close
            }
          }
        }>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Measurement</DialogTitle>
                    <DialogDescription>
                        Record {babyProfile?.name}'s weight and/or height.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMeasurementSubmit} className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="birthday-switch" checked={useBirthdayDate} onCheckedChange={setUseBirthdayDate} />
                        <Label htmlFor="birthday-switch">Use birthday for date</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !measurementDate && "text-muted-foreground")}
                                    disabled={useBirthdayDate}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {measurementDate ? format(measurementDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={measurementDate} onSelect={setMeasurementDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-weight">Weight (kg)</Label>
                            <Input id="new-weight" type="number" step="0.01" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="e.g. 4.1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-height">Height (cm)</Label>
                            <Input id="new-height" type="number" step="0.1" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} placeholder="e.g. 53.5" />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                         </DialogClose>
                         <Button type="submit" disabled={isSavingMeasurement}>
                            {isSavingMeasurement && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Measurement
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    
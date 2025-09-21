
'use client';
import React, { useState, useEffect, useTransition, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Baby, Smile, Loader2, ImagePlus, X, Paperclip, View } from 'lucide-react';
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


const growthData = [
  { month: 'Birth', weight: 7.5, length: 20 },
  { month: '1m', weight: 9.9, length: 21.5 },
  { month: '2m', weight: 12.4, length: 23 },
  { month: '4m', weight: 15.5, length: 25 },
  { month: '6m', weight: 17.5, length: 26.5 },
  { month: '9m', weight: 20, length: 28 },
  { month: '12m', weight: 22, length: 29.5 },
];

const babyChartConfig = {
  weight: { label: 'Weight (lbs)', color: 'hsl(var(--primary))' },
  length: { label: 'Length (in)', color: 'hsl(var(--accent-foreground))' },
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


  const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('session_token');
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  useEffect(() => {
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
  }, [toast]);

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
                        <CardTitle>Baby's Growth Milestones</CardTitle>
                        <CardDescription>Visualizing weight and length over the first year.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={babyChartConfig} className="h-[400px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={growthData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis yAxisId="left" orientation="left" stroke={babyChartConfig.weight.color} />
                                    <YAxis yAxisId="right" orientation="right" stroke={babyChartConfig.length.color} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="weight" name="Weight (lbs)" fill={babyChartConfig.weight.color} radius={4} yAxisId="left" />
                                    <Bar dataKey="length" name="Length (in)" fill={babyChartConfig.length.color} radius={4} yAxisId="right" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
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
    </div>
  );
}

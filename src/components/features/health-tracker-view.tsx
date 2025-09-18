
'use client';
import React, { useState } from 'react';
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
import { Baby, Smile } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';


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

const initialVaccinations = [
    { id: 1, name: 'Hepatitis B (HepB)', age: 'Birth', dose: '1st', status: true, description: 'Protects against Hepatitis B, a liver disease that can be serious. The first shot is usually given within 24 hours of birth.' },
    { id: 2, name: 'Hepatitis B (HepB)', age: '1-2 months', dose: '2nd', status: true, description: 'The second dose of the Hepatitis B vaccine series, continuing protection.' },
    { id: 3, name: 'Rotavirus (RV)', age: '2 months', dose: '1st', status: true, description: 'Protects against rotavirus, which causes severe diarrhea, vomiting, fever, and abdominal pain, mostly in babies and young children.' },
    { id: 4, name: 'DTaP', age: '2 months', dose: '1st', status: true, description: 'Protects against Diphtheria, Tetanus, and Pertussis (whooping cough).' },
    { id: 5, name: 'Hib', age: '2 months', dose: '1st', status: true, description: 'Protects against Haemophilus influenzae type b, a type of bacteria that can cause serious illness, including meningitis and pneumonia.' },
    { id: 6, name: 'Pneumococcal (PCV13)', age: '2 months', dose: '1st', status: true, description: 'Protects against pneumococcal disease, which can lead to ear infections, pneumonia, and meningitis.' },
    { id: 7, name: 'Polio (IPV)', age: '2 months', dose: '1st', status: true, description: 'Protects against polio, a disabling and life-threatening disease caused by the poliovirus.' },
    { id: 8, name: 'Rotavirus (RV)', age: '4 months', dose: '2nd', status: false, description: 'Second dose to build immunity against rotavirus.' },
    { id: 9, name: 'DTaP', age: '4 months', dose: '2nd', status: false, description: 'Second dose of the DTaP series.' },
    { id: 10, name: 'Hib', age: '4 months', dose: '2nd', status: false, description: 'Second dose of the Hib series.' },
    { id: 11, name: 'Pneumococcal (PCV13)', age: '4 months', dose: '2nd', status: false, description: 'Second dose of the pneumococcal conjugate vaccine.' },
    { id: 12, name: 'Polio (IPV)', age: '4 months', dose: '2nd', status: false, description: 'Second dose of the inactivated poliovirus vaccine.' },
];

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
  const [vaccinations, setVaccinations] = useState(initialVaccinations);

  const handleVaxStatusChange = (id: number, checked: boolean) => {
    setVaccinations(
      vaccinations.map((vax) =>
        vax.id === id ? { ...vax, status: checked } : vax
      )
    );
  };
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
                        <Accordion type="single" collapsible className="w-full">
                           {vaccinations.map((vax) => (
                             <AccordionItem value={`item-${vax.id}`} key={vax.id}>
                               <AccordionTrigger className="hover:no-underline">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="text-left">
                                       <div className="font-semibold">{vax.name}</div>
                                       <div className="text-sm text-muted-foreground">{`Recommended Age: ${vax.age} (Dose: ${vax.dose})`}</div>
                                   </div>
                                   <Badge variant={vax.status ? 'default' : 'secondary'} className={cn(vax.status ? "bg-green-600 hover:bg-green-700" : "")}>{vax.status ? 'Complete' : 'Pending'}</Badge>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent>
                                 <p className="text-muted-foreground mb-4">{vax.description}</p>
                                 <div className="flex items-center space-x-2">
                                     <Checkbox
                                       id={`vax-check-${vax.id}`}
                                       checked={vax.status}
                                       onCheckedChange={(checked) => handleVaxStatusChange(vax.id, checked as boolean)}
                                       aria-label={`Mark ${vax.name} as ${vax.status ? 'incomplete' : 'complete'}`}
                                     />
                                     <Label htmlFor={`vax-check-${vax.id}`} className="cursor-pointer">
                                        Mark as complete
                                     </Label>
                                 </div>
                               </AccordionContent>
                             </AccordionItem>
                           ))}
                         </Accordion>
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
    </div>
  );
}

    

    
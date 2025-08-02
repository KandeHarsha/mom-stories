'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Baby } from 'lucide-react';

const growthData = [
  { month: 'Birth', weight: 7.5, length: 20 },
  { month: '1m', weight: 9.9, length: 21.5 },
  { month: '2m', weight: 12.4, length: 23 },
  { month: '4m', weight: 15.5, length: 25 },
  { month: '6m', weight: 17.5, length: 26.5 },
  { month: '9m', weight: 20, length: 28 },
  { month: '12m', weight: 22, length: 29.5 },
];

const chartConfig = {
  weight: { label: 'Weight (lbs)', color: 'hsl(var(--primary))' },
  length: { label: 'Length (in)', color: 'hsl(var(--accent))' },
};

const vaccinations = [
    { name: 'Hepatitis B (HepB)', age: 'Birth', doses: '1st', status: true },
    { name: 'Hepatitis B (HepB)', age: '1-2 months', doses: '2nd', status: true },
    { name: 'Rotavirus (RV)', age: '2 months', doses: '1st', status: true },
    { name: 'DTaP', age: '2 months', doses: '1st', status: true },
    { name: 'Hib', age: '2 months', doses: '1st', status: true },
    { name: 'Pneumococcal (PCV13)', age: '2 months', doses: '1st', status: true },
    { name: 'Polio (IPV)', age: '2 months', doses: '1st', status: true },
    { name: 'Rotavirus (RV)', age: '4 months', doses: '2nd', status: false },
    { name: 'DTaP', age: '4 months', doses: '2nd', status: false },
    { name: 'Hib', age: '4 months', doses: '2nd', status: false },
    { name: 'Pneumococcal (PCV13)', age: '4 months', doses: '2nd', status: false },
    { name: 'Polio (IPV)', age: '4 months', doses: '2nd', status: false },
];

export default function HealthTrackerView() {
  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Baby className="h-8 w-8 text-primary"/>
                Growth & Health Tools
            </h2>
            <p className="text-muted-foreground mt-1">
                Keep track of important milestones and health data with ease and clarity.
            </p>
        </div>
        <Tabs defaultValue="growth" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="growth">Growth Chart</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
            </TabsList>
            <TabsContent value="growth" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Baby's Growth Milestones</CardTitle>
                        <CardDescription>Visualizing weight and length over the first year.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[400px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={growthData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="weight" fill="hsl(var(--primary))" radius={4} yAxisId="left" />
                                    <Bar dataKey="length" fill="hsl(var(--accent))" radius={4} yAxisId="right" />
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vaccine</TableHead>
                                    <TableHead>Recommended Age</TableHead>
                                    <TableHead>Dose</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vaccinations.map((vax) => (
                                    <TableRow key={`${vax.name}-${vax.doses}`}>
                                        <TableCell className="font-medium">{vax.name}</TableCell>
                                        <TableCell>{vax.age}</TableCell>
                                        <TableCell>{vax.doses}</TableCell>
                                        <TableCell className="text-right">
                                            <Checkbox checked={vax.status} aria-label={`Mark ${vax.name} ${vax.doses} as complete`}/>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

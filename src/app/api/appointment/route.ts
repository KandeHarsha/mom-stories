// src/app/api/appointment/route.ts
import { NextResponse } from 'next/server';
import { getAppointments, addAppointment, type AppointmentType } from '@/services/appointment-service';
import { auth } from "@/lib/auth";

// Get all appointments
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const appointments = await getAppointments(session.user.id);
        return new NextResponse(JSON.stringify(appointments), { status: 200 });
    } catch (error) {
        console.error('Get Appointments Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch appointments.', details: errorMessage }), { status: 500 });
    }
}

// Create a new appointment
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { date, doctor, type, fastingRequired, tests } = body;

        if (!date) {
            return new NextResponse(JSON.stringify({ error: 'Date is required.' }), { status: 400 });
        }

        const validTypes = ['doctor', 'lab', 'physiotherapy', 'dietitian', 'mental_wellness'];
        if (type && !validTypes.includes(type)) {
            return new NextResponse(JSON.stringify({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}.` }), { status: 400 });
        }

        // Validate tests array if provided
        if (tests !== undefined && (!Array.isArray(tests) || !tests.every(test => typeof test === 'string'))) {
            return new NextResponse(JSON.stringify({ error: 'tests must be an array of strings.' }), { status: 400 });
        }

        const dataToSave: {
            userId: string;
            date: string;
            type?: AppointmentType;
            fastingRequired?: boolean;
            doctor?: string;
            tests?: string[];
        } = {
            userId,
            date,
        };

        if (type) {
            dataToSave.type = type as AppointmentType;
        }

        if (fastingRequired !== undefined) {
            dataToSave.fastingRequired = Boolean(fastingRequired);
        }

        if (doctor) {
            dataToSave.doctor = doctor;
        }

        if (tests && tests.length > 0) {
            dataToSave.tests = tests;
        }

        const newAppointmentId = await addAppointment(dataToSave);

        return new NextResponse(JSON.stringify({ success: true, id: newAppointmentId, ...dataToSave }), { status: 201 });

    } catch (error) {
        console.error('Create Appointment Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to save appointment.', details: errorMessage }), { status: 500 });
    }
}

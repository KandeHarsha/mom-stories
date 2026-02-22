// src/app/api/appointment/[appointmentId]/route.ts
import { NextResponse } from 'next/server';
import { updateAppointment } from '@/services/appointment-service';
import { auth } from '@/lib/auth';

// Update an appointment with doctor notes and medications
export async function PUT(request: Request, { params }: { params: { appointmentId: string } }) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const appointmentId = params.appointmentId;
        
        if (!appointmentId) {
            return new NextResponse(JSON.stringify({ error: 'Appointment ID is required.' }), { status: 400 });
        }
        
        const data = await request.json();
        const { doctorNotes, medications } = data;

        const updateData: { doctorNotes?: string; medications?: string } = {};
        
        if (doctorNotes !== undefined) {
            updateData.doctorNotes = doctorNotes;
        }
        
        if (medications !== undefined) {
            updateData.medications = medications;
        }

        if (Object.keys(updateData).length === 0) {
            return new NextResponse(JSON.stringify({ error: 'At least one field (doctorNotes or medications) is required.' }), { status: 400 });
        }

        await updateAppointment(appointmentId, userId, updateData);

        return new NextResponse(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Update Appointment Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to update appointment.', details: errorMessage }), { status: 500 });
    }
}

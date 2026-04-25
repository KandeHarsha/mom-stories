// src/app/api/appointment/[appointmentId]/route.ts
import { NextResponse } from 'next/server';
import { updateAppointment, addAppointment, type AppointmentType } from '@/services/appointment-service';
import { uploadFileAndGetURL } from '@/services/journal-service';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Update an appointment with notes, medications, documents, and other fields
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
        
        const formData = await request.formData();
        
        // Extract text fields
        const notes = formData.get('notes') as string | null;
        const medicationsJson = formData.get('medications') as string | null;
        const exercisesJson = formData.get('exercises') as string | null;
        const followUp = formData.get('followUp') as string | null;
        const painScoreStr = formData.get('painScore') as string | null;
        const dietPlan = formData.get('dietPlan') as string | null;
        const isCancelledStr = formData.get('isCancelled') as string | null;
        const isRescheduledStr = formData.get('isRescheduled') as string | null;

        const updateData: {
            notes?: string;
            medications?: string[];
            exercises?: string[];
            followUp?: string;
            painScore?: number;
            dietPlan?: string;
            documents?: string[];
            isCancelled?: boolean;
            isRescheduled?: boolean;
        } = {};
        
        // Handle notes
        if (notes !== null) {
            updateData.notes = notes;
        }
        
        // Handle medications array
        if (medicationsJson !== null) {
            try {
                const medications = JSON.parse(medicationsJson);
                if (Array.isArray(medications)) {
                    updateData.medications = medications;
                } else {
                    return new NextResponse(JSON.stringify({ error: 'medications must be an array.' }), { status: 400 });
                }
            } catch {
                return new NextResponse(JSON.stringify({ error: 'Invalid medications JSON format.' }), { status: 400 });
            }
        }
        
        // Handle exercises array
        if (exercisesJson !== null) {
            try {
                const exercises = JSON.parse(exercisesJson);
                if (Array.isArray(exercises)) {
                    updateData.exercises = exercises;
                } else {
                    return new NextResponse(JSON.stringify({ error: 'exercises must be an array.' }), { status: 400 });
                }
            } catch {
                return new NextResponse(JSON.stringify({ error: 'Invalid exercises JSON format.' }), { status: 400 });
            }
        }
        
        // Handle followUp date
        if (followUp !== null) {
            updateData.followUp = followUp;
        }
        
        // Handle pain score with validation
        if (painScoreStr !== null) {
            const painScore = parseInt(painScoreStr, 10);
            if (isNaN(painScore) || painScore < 0 || painScore > 10) {
                return new NextResponse(JSON.stringify({ error: 'painScore must be an integer between 0 and 10.' }), { status: 400 });
            }
            updateData.painScore = painScore;
        }
        
        // Handle diet plan
        if (dietPlan !== null) {
            updateData.dietPlan = dietPlan;
        }
        
        // Handle boolean flags
        if (isCancelledStr !== null) {
            updateData.isCancelled = isCancelledStr === 'true';
        }
        
        if (isRescheduledStr !== null) {
            updateData.isRescheduled = isRescheduledStr === 'true';
        }
        
        // Handle document file uploads
        const documentFiles: File[] = [];
        let fileIndex = 0;
        while (true) {
            const file = formData.get(`document${fileIndex}`) as File | null;
            if (!file || file.size === 0) break;
            documentFiles.push(file);
            fileIndex++;
        }
        
        // Upload documents to Firebase Storage
        if (documentFiles.length > 0) {
            const documentUrls: string[] = [];
            for (const file of documentFiles) {
                const url = await uploadFileAndGetURL(file, userId, 'appointment-documents');
                documentUrls.push(url);
            }
            updateData.documents = documentUrls;
        }

        if (Object.keys(updateData).length === 0) {
            return new NextResponse(JSON.stringify({ error: 'At least one field is required to update.' }), { status: 400 });
        }

        // Update the appointment
        await updateAppointment(appointmentId, userId, updateData);

        const responseData: { success: boolean; followUpAppointmentId?: string } = { success: true };

        // Create follow-up appointment if followUp date is provided
        if (followUp) {
            try {
                // Fetch the original appointment to get doctor, type, and fastingRequired
                const appointmentRef = doc(db, 'appointments', appointmentId);
                const appointmentSnap = await getDoc(appointmentRef);
                
                if (appointmentSnap.exists()) {
                    const appointmentData = appointmentSnap.data();
                    
                    const followUpData: {
                        userId: string;
                        date: string;
                        isFollowUp: boolean;
                        parentAppointmentId: string;
                        doctor?: string;
                        type?: AppointmentType;
                        fastingRequired?: boolean;
                    } = {
                        userId,
                        date: followUp,
                        isFollowUp: true,
                        parentAppointmentId: appointmentId,
                    };
                    
                    // Copy doctor, type, and fastingRequired from original appointment
                    if (appointmentData.doctor) {
                        followUpData.doctor = appointmentData.doctor;
                    }
                    if (appointmentData.type) {
                        followUpData.type = appointmentData.type as AppointmentType;
                    }
                    if (appointmentData.fastingRequired !== undefined) {
                        followUpData.fastingRequired = appointmentData.fastingRequired;
                    }
                    
                    const followUpAppointmentId = await addAppointment(followUpData);
                    responseData.followUpAppointmentId = followUpAppointmentId;
                }
            } catch (followUpError) {
                console.error('Error creating follow-up appointment:', followUpError);
                // Continue even if follow-up creation fails
            }
        }

        return new NextResponse(JSON.stringify(responseData), { status: 200 });

    } catch (error) {
        console.error('Update Appointment Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to update appointment.', details: errorMessage }), { status: 500 });
    }
}

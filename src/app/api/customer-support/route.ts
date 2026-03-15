// src/app/api/customer-support/route.ts
import { NextResponse } from 'next/server';
import { createCustomerSupportTicket } from '@/services/customer-support-service';
import { auth } from "@/lib/auth";

// Create a new customer support ticket
export async function POST(request: Request) {
    try {
        // Get session (optional - can be anonymous)
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const userId = session?.user?.id;

        const body = await request.json();
        const { type, email, query } = body;

        // Validate required field: query
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'Query is required and must be a non-empty string.' }), 
                { status: 400 }
            );
        }

        // If no userId (anonymous), email is required
        if (!userId && (!email || typeof email !== 'string' || email.trim().length === 0)) {
            return new NextResponse(
                JSON.stringify({ error: 'Email is required for anonymous submissions.' }), 
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (email && email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return new NextResponse(
                    JSON.stringify({ error: 'Invalid email format.' }), 
                    { status: 400 }
                );
            }
        }

        // Validate type if provided
        const validTypes = ['bugReport', 'featureRequest'];
        const ticketType = type || 'bugReport';
        
        if (!validTypes.includes(ticketType)) {
            return new NextResponse(
                JSON.stringify({ error: 'Type must be either "bugReport" or "featureRequest".' }), 
                { status: 400 }
            );
        }

        // Create ticket data
        const ticketData: {
            type: 'bugReport' | 'featureRequest';
            userId?: string;
            email?: string;
            query: string;
            status: string;
        } = {
            type: ticketType as 'bugReport' | 'featureRequest',
            query: query.trim(),
            status: 'submitted',
        };

        // Add userId if authenticated
        if (userId) {
            ticketData.userId = userId;
        }

        // Add email if provided
        if (email && email.trim().length > 0) {
            ticketData.email = email.trim();
        }

        // Save to database
        const ticketId = await createCustomerSupportTicket(ticketData);

        return new NextResponse(
            JSON.stringify({ 
                success: true, 
                id: ticketId,
                message: 'Customer support ticket submitted successfully.',
            }), 
            { status: 201 }
        );

    } catch (error) {
        console.error('Create Customer Support Ticket Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(
            JSON.stringify({ 
                error: 'Failed to submit customer support ticket.', 
                details: errorMessage 
            }), 
            { status: 500 }
        );
    }
}

// src/app/api/notification-registry/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    addNotificationRegistration,
    getNotificationRegistrations,
    VALID_SOURCE_TYPES,
    VALID_STATUSES,
} from '@/services/notification-registry-service';

// GET: List all notification registrations for the authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const registrations = await getNotificationRegistrations(session.user.id);

        return NextResponse.json(registrations, { status: 200 });
    } catch (error) {
        console.error('Get Notification Registrations Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to retrieve notification registrations.', details: errorMessage },
            { status: 500 }
        );
    }
}

// POST: Create a new notification registration
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();

        const { expoNotificationId, sourceType, sourceId, title, body: notifBody, data, trigger, scheduledAt, repeats, status, deviceId } = body;

        // Validate required fields
        if (!expoNotificationId || typeof expoNotificationId !== 'string' || expoNotificationId.trim() === '') {
            return NextResponse.json({ error: 'expoNotificationId is required.' }, { status: 400 });
        }

        if (!sourceType || !VALID_SOURCE_TYPES.includes(sourceType)) {
            return NextResponse.json(
                { error: `sourceType is required and must be one of: ${VALID_SOURCE_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        if (!sourceId || typeof sourceId !== 'string' || sourceId.trim() === '') {
            return NextResponse.json({ error: 'sourceId is required.' }, { status: 400 });
        }

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'title is required.' }, { status: 400 });
        }

        if (!notifBody || typeof notifBody !== 'string' || notifBody.trim() === '') {
            return NextResponse.json({ error: 'body is required.' }, { status: 400 });
        }

        if (!trigger || typeof trigger !== 'object' || Array.isArray(trigger)) {
            return NextResponse.json({ error: 'trigger is required and must be an object.' }, { status: 400 });
        }

        if (!scheduledAt || typeof scheduledAt !== 'string' || scheduledAt.trim() === '') {
            return NextResponse.json({ error: 'scheduledAt is required.' }, { status: 400 });
        }

        // Validate optional status field; default to 'active'
        const resolvedStatus = status ?? 'active';
        if (!VALID_STATUSES.includes(resolvedStatus)) {
            return NextResponse.json(
                { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        const id = await addNotificationRegistration({
            userId,
            expoNotificationId: expoNotificationId.trim(),
            sourceType,
            sourceId: sourceId.trim(),
            title: title.trim(),
            body: notifBody.trim(),
            ...(data !== undefined && { data }),
            trigger,
            scheduledAt: scheduledAt.trim(),
            repeats: repeats === true,
            status: resolvedStatus,
            deviceId: deviceId.trim(),
        });

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Create Notification Registration Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to create notification registration.', details: errorMessage },
            { status: 500 }
        );
    }
}

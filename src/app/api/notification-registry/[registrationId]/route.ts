// src/app/api/notification-registry/[registrationId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateNotificationRegistration, VALID_STATUSES } from '@/services/notification-registry-service';

// PATCH: Update a notification registration by ID
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ registrationId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const userId = session.user.id;
        const { registrationId } = await params;

        if (!registrationId) {
            return NextResponse.json({ error: 'Registration ID is required.' }, { status: 400 });
        }

        const body = await request.json();

        const { expoNotificationId, title, body: notifBody, data, trigger, scheduledAt, repeats, status, deviceId } = body;

        // Validate each provided field
        if (expoNotificationId !== undefined && (typeof expoNotificationId !== 'string' || expoNotificationId.trim() === '')) {
            return NextResponse.json({ error: 'expoNotificationId must be a non-empty string.' }, { status: 400 });
        }

        if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
            return NextResponse.json({ error: 'title must be a non-empty string.' }, { status: 400 });
        }

        if (notifBody !== undefined && (typeof notifBody !== 'string' || notifBody.trim() === '')) {
            return NextResponse.json({ error: 'body must be a non-empty string.' }, { status: 400 });
        }

        if (trigger !== undefined && (typeof trigger !== 'object' || Array.isArray(trigger) || trigger === null)) {
            return NextResponse.json({ error: 'trigger must be an object.' }, { status: 400 });
        }

        if (scheduledAt !== undefined && (typeof scheduledAt !== 'string' || scheduledAt.trim() === '')) {
            return NextResponse.json({ error: 'scheduledAt must be a non-empty string.' }, { status: 400 });
        }

        if (deviceId !== undefined && (typeof deviceId !== 'string' || deviceId.trim() === '')) {
            return NextResponse.json({ error: 'deviceId must be a non-empty string.' }, { status: 400 });
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        const updates = {
            ...(expoNotificationId !== undefined && { expoNotificationId: expoNotificationId.trim() }),
            ...(title !== undefined && { title: title.trim() }),
            ...(notifBody !== undefined && { body: notifBody.trim() }),
            ...(data !== undefined && { data }),
            ...(trigger !== undefined && { trigger }),
            ...(scheduledAt !== undefined && { scheduledAt: scheduledAt.trim() }),
            ...(repeats !== undefined && { repeats: repeats === true }),
            ...(status !== undefined && { status }),
            ...(deviceId !== undefined && { deviceId: deviceId.trim() }),
        };

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided to update.' }, { status: 400 });
        }

        await updateNotificationRegistration(registrationId, userId, updates);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Update Notification Registration Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        if (errorMessage === 'Notification registration not found.') {
            return NextResponse.json({ error: errorMessage }, { status: 404 });
        }

        if (errorMessage === 'Unauthorized access to notification registration.') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(
            { error: 'Failed to update notification registration.', details: errorMessage },
            { status: 500 }
        );
    }
}

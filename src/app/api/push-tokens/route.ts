// src/app/api/push-tokens/route.ts
import { NextResponse } from 'next/server';
import { savePushToken } from '@/services/notification-service';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const pushTokenSchema = z.object({
    expoPushToken: z.string().startsWith('ExponentPushToken['),
    deviceManufacturer: z.string().optional(),
    deviceModelName: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = pushTokenSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: 'Invalid data', details: validatedData.error.flatten() }, { status: 400 });
        }
        
        await savePushToken({
            userId: session.user.id,
            ...validatedData.data,
        });

        return NextResponse.json({ success: true, message: 'Push token saved successfully.' }, { status: 201 });

    } catch (error) {
        console.error('Save Push Token Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            error: 'Failed to save push token.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

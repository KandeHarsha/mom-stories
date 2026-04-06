// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/services/notification-service';
import { auth } from '@/lib/auth';

interface NotificationRequest {
  to: string | string[];
  title: string;
  body: string;
}

export async function POST(request: Request) {
  try {
    // Verify user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to continue.' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { to, title, body }: NotificationRequest = await request.json();

    // Validate required fields
    if (!to || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, title, and body are required' },
        { status: 400 }
      );
    }

    // Validate expo push token format
    const tokens = Array.isArray(to) ? to : [to];
    const validTokenPattern = /^ExponentPushToken\[.+\]$/;
    
    for (const token of tokens) {
      if (!validTokenPattern.test(token)) {
        return NextResponse.json(
          { error: `Invalid Expo push token format: ${token}` },
          { status: 400 }
        );
      }
    }

    // Send notification to Expo API
    const result = await sendPushNotification(to, title, body);

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );

  } catch (error) {
    console.error('Notification API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to send notification', details: errorMessage },
      { status: 500 }
    );
  }
}

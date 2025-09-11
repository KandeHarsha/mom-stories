// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// This endpoint is now primarily for setting the session cookie after a successful client-side login.
const loginSessionSchema = z.object({
  token: z.string().min(1, 'Access token is required.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSessionSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.flatten().fieldErrors }, { status: 400 });
    }

    // The access token is received from the client after LoginRadius onSuccess
    const { token } = validatedData.data;

    // Set a session cookie for middleware to read
    cookies().set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/',
    });

    return NextResponse.json({ success: true, message: 'Session created successfully.'}, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

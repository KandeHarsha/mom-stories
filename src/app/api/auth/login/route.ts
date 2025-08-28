
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { loginUser, loginSchema } from '@/services/auth-service';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);
    console.log("validatedData", validatedData);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors.map(e => e.message).join(', ') }, { status: 400 });
    }

    const userCredential = await loginUser(validatedData.data);
    const idToken = await userCredential.access_token;

    // Set a cookie to manage the session
    cookies().set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
    
    return NextResponse.json({ success: true, message: 'Logged in successfully.' }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 401 }); // Unauthorized
  }
}

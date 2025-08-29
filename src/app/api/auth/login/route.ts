
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { loginUser, loginSchema } from '@/services/auth-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors.map(e => e.message).join(', ') }, { status: 400 });
    }

    const loginResponse = await loginUser(validatedData.data);
    
    // Send the access token and profile data to the frontend
    return NextResponse.json({ 
        success: true, 
        message: 'Logged in successfully.',
        token: loginResponse.access_token,
        profile: loginResponse.Profile
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 401 }); // Unauthorized
  }
}

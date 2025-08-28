
// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { registerUser, registerSchema } from '@/services/auth-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors.map(e => e.message).join(', ') }, { status: 400 });
    }

    await registerUser(validatedData.data);

    return NextResponse.json({ success: true, message: 'User registered successfully.' }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

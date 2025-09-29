// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { loginUser, loginSchema } from '@/services/auth-service';

// Server-side login endpoint: accept email & password, call LoginRadius via loginUser,
// then store an HttpOnly session cookie containing the access token.

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const lrResponse = await loginUser(parsed.data);

    // Try several common fields where the access token may be returned
    const accessToken = lrResponse?.access_token || lrResponse?.accessToken || lrResponse?.token || lrResponse?.data?.access_token;

    if (!accessToken) {
      // Return the raw response for debugging in non-production environments
      return NextResponse.json({ error: 'Login succeeded but no access token returned.', raw: lrResponse }, { status: 502 });
    }

    const res = NextResponse.json({ data: lrResponse });
    res.cookies.set('session', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    const message = error?.message || 'Login failed.';
    // If the auth-service returned a descriptive message, forward it and use 401
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

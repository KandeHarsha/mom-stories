
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // With token-based auth stored on the client, the primary job
    // of logout is to have the client delete the token.
    // This server endpoint is here in case there's a server-side session
    // to invalidate in the future (e.g., with a refresh token blacklist).
    // For now, it just confirms the logout action.
    
    // If you were using server-side sessions with cookies, you would clear them here.
    // For example:
    // const response = NextResponse.json({ success: true, message: 'Logged out' });
    // response.cookies.set('session', '', { maxAge: -1 });
    // return response;

    return NextResponse.json({ success: true, message: 'Logout acknowledged.' }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

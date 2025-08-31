
// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getUserProfile, validateAccessToken } from '@/services/auth-service';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized: No token provided' }), { status: 401 });
    }

    // First, validate the token to ensure it's not expired or invalid
    await validateAccessToken(token);

    // If validation is successful, get the full profile
    const profile = await getUserProfile(token);
    
    return NextResponse.json(profile, { status: 200 });

  } catch (error) {
    console.error('Get Profile API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Clear cookie on client if token is invalid
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch user profile.', details: errorMessage }), { 
        status: 401,
        headers: {
            'Set-Cookie': 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
    });
  }
}

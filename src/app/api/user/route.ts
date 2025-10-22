// src/app/api/user/route.ts
import { NextResponse } from 'next/server';
import { getUserProfile } from '@/services/user-service';
import { getUserProfile as loginradiusUserProfile } from '@/services/auth-service';
import { validateAccessToken } from '@/services/auth-service';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // Validate the token with LoginRadius
    const validationResult = await loginradiusUserProfile(token);
    
    // Get the Uid from the validation result
    const uid = validationResult?.Uid;
    if (!uid) {
      return NextResponse.json({ error: 'Invalid token: No user ID found' }, { status: 401 });
    }

    // Fetch user profile from Firebase
    const userProfile = await getUserProfile(uid);
    
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error('Get User API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch user profile.', details: errorMessage }, { status: 500 });
  }
}

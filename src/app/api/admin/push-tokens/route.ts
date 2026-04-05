// src/app/api/admin/push-tokens/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPushTokensWithUserData } from '@/services/push-token-service';

export async function GET(request: Request) {
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

    // Get phase filter from query params
    const { searchParams } = new URL(request.url);
    const phaseFilter = searchParams.get('phase');

    // Fetch push tokens with user data
    const tokens = await getPushTokensWithUserData(phaseFilter);

    return NextResponse.json({ tokens }, { status: 200 });

  } catch (error) {
    console.error('Admin Push Tokens API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch push tokens', details: errorMessage },
      { status: 500 }
    );
  }
}

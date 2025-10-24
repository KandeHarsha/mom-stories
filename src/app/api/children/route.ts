import { NextResponse } from 'next/server';
import { createChildProfile } from '@/services/child-service';
import { getUserProfile } from '@/services/auth-service';

// Create a new child profile
export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userProfileResponse = await getUserProfile(token);
        if (!userProfileResponse.Uid) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const data = await request.json();
        const { name, birthday, birthHeight, birthWeight, gender } = data;

        if (!name || !birthday || !birthHeight || !birthWeight || !gender) {
            return NextResponse.json({ 
                error: 'Missing required fields. Please provide name, birthday, birthHeight, birthWeight, and gender.' 
            }, { status: 400 });
        }

        // Validate gender
        if (!['Male', 'Female', 'Other'].includes(gender)) {
            return NextResponse.json({ 
                error: 'Invalid gender. Must be Male, Female, or Other.' 
            }, { status: 400 });
        }

        // Create child profile
        const childId = await createChildProfile({
            parentId: userProfileResponse.Uid,
            name,
            birthday: new Date(birthday),
            birthHeight: parseFloat(birthHeight),
            birthWeight: parseFloat(birthWeight),
            gender,
        });

        // Fetch the created child profile to return to client
        const { getChildProfile } = await import('@/services/child-service');
        const childProfile = await getChildProfile(childId);

        return NextResponse.json({ 
            success: true, 
            childId,
            profile: childProfile,
            message: 'Child profile created successfully!' 
        }, { status: 201 });

    } catch (error) {
        console.error('Create Child Profile Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            error: 'Failed to create child profile.', 
            details: errorMessage 
        }, { status: 500 });
    }
}

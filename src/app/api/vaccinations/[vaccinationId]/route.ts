// src/app/api/vaccinations/[vaccinationId]/route.ts
import { NextResponse } from 'next/server';
import { updateVaccinationStatus } from '@/services/vaccination-service';
import { getUserProfile } from '@/services/auth-service';
import { uploadFileAndGetURL } from '@/services/journal-service';

// Update vaccination status
export async function PUT(request: Request, { params }: { params: { vaccinationId: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userProfileResponse = await getUserProfile(token);
        if (!userProfileResponse.Uid) {
            return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }
        
        const vaccinationId = params.vaccinationId;
        if (!vaccinationId) {
            return new NextResponse(JSON.stringify({ error: 'Vaccination ID is required.' }), { status: 400 });
        }
        
        const formData = await request.formData();
        const statusValue = formData.get('status');
        const imageFile = formData.get('image') as File | null;
        
        const status = statusValue === '1' ? 1 : 0;
        
        let imageUrl: string | undefined = undefined;

        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadFileAndGetURL(imageFile, userProfileResponse.Uid, 'vaccination-tags');
        }

        await updateVaccinationStatus(userProfileResponse.Uid, vaccinationId, status, imageUrl);

        return new NextResponse(JSON.stringify({ success: true, imageUrl }), { status: 200 });

    } catch (error) {
        console.error('Update Vaccination Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to update vaccination status.', details: errorMessage }), { status: 500 });
    }
}

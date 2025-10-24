import { NextResponse } from 'next/server';
import { verifyEmail } from '@/services/auth-service';
import { createUserProfile } from '@/services/user-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vtype = searchParams.get('vtype');
    const vtoken = searchParams.get('vtoken');

    const loginUrl = new URL('/login', request.url);

    if (vtype !== "emailverification" || !vtoken) {
        loginUrl.searchParams.set('error', 'Invalid verification link.');
        return NextResponse.redirect(loginUrl);
    }

    try {
        const result = await verifyEmail(vtoken);

        // Check if LoginRadius returned an error
        if (result.ErrorCode || result.Description) {
            console.error("LoginRadius verification error:", result);
            return NextResponse.json({ 
                error: result.Description || result.Message || 'Email verification failed.' 
            }, { status: 400 });
        }

        // Extract user profile data from the verification response
        const profile = result?.Data?.Profile;

        if (profile && profile.Uid) {
            // Add user to Firebase userProfiles collection
            await createUserProfile(profile.Uid, {
                Uid: profile.Uid,
                FirstName: profile.FirstName || '',
                Email: profile.Email || [],
                Provider: profile.Provider || '',
                RegistrationProvider: profile.RegistrationProvider || '',
                Identities: profile.Identities || null,
            });
            
            return NextResponse.json({ 
                success: true, 
                message: 'Email verified successfully!' 
            }, { status: 200 });
        }

        return NextResponse.json({ 
            error: 'Verification successful, but could not create profile.' 
        }, { status: 400 });

    } catch (error: any) {
        console.error("Verification API Error:", error);
        return NextResponse.json({ 
            error: error.message || 'Email verification failed.' 
        }, { status: 400 });
    }
}

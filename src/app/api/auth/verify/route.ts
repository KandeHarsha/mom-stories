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
        
        // Extract user profile data from the verification response
        const profile = result?.Data?.Profile;
        
        if (profile && profile.Uid) {
            // Add user to Firebase userProfiles collection
            await createUserProfile(profile.Uid, {
                Uid: profile.Uid,
                Id: profile.ID,
                FirstName: profile.FirstName || '',
                LastName: profile.LastName || '',
                FullName: profile.FullName || profile.FirstName || '',
                Provider: profile.Provider || '',
                RegistrationProvider: profile.RegistrationProvider || '',
                Email: profile.Email || [],
                Identities: profile.Identities || null,
                phase: profile.Company || '',
            });
            loginUrl.searchParams.set('verified', 'true');
            return NextResponse.redirect(loginUrl);
        }
        
        loginUrl.searchParams.set('error', 'Verification successful, but could not create profile.');
        return NextResponse.redirect(loginUrl);
        
    } catch (error: any) {
        console.error("Verification API Error:", error);
        loginUrl.searchParams.set('error', error.message || 'Email verification failed.');
        return NextResponse.redirect(loginUrl);
    }
}

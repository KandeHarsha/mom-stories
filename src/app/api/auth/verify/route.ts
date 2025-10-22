import { NextResponse } from 'next/server';
import { verifyEmail } from '@/services/auth-service';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vtype = searchParams.get('vtype');
    const vtoken = searchParams.get('vtoken');

    if (vtype !== "emailverification" || !vtoken) {
        return NextResponse.json(
            { error: "Invalid or missing verification parameters." },
            { status: 400 }
        );
    }

    try {
        const result = await verifyEmail(vtoken);
        
        // Extract user profile data from the verification response
        const profile = result?.Data?.Profile;
        
        if (profile && profile.Uid) {
            // Add user to Firebase userProfiles collection
            const userDocRef = doc(db, 'userProfiles', profile.Uid);
            
            await setDoc(userDocRef, {
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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true }); // Use merge to avoid overwriting if user already exists
        }
        
        return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

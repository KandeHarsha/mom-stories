import { NextResponse } from 'next/server';
import { verifyEmail } from '@/services/auth-service';

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
        return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPregnancy, updatePregnancy, type PregnancyStatus } from '@/services/pregnancy-service';

interface RouteParams {
    params: Promise<{ pregnancyId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { pregnancyId } = await params;
        const pregnancy = await getPregnancy(pregnancyId);

        if (!pregnancy) {
            return NextResponse.json({ error: 'Pregnancy record not found.' }, { status: 404 });
        }

        if (pregnancy.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
        }

        return NextResponse.json({ pregnancy });
    } catch (error) {
        console.error('Get Pregnancy Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to fetch pregnancy record.', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { pregnancyId } = await params;
        const pregnancy = await getPregnancy(pregnancyId);

        if (!pregnancy) {
            return NextResponse.json({ error: 'Pregnancy record not found.' }, { status: 404 });
        }

        if (pregnancy.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
        }

        const data = await request.json();
        const { babyNickname, dueDate, status } = data;

        // Validate status if provided
        const validStatuses: PregnancyStatus[] = ['active', 'completed', 'miscarried'];
        if (status !== undefined && !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` },
                { status: 400 }
            );
        }

        // Validate dueDate if provided
        let parsedDueDate: Date | undefined;
        if (dueDate !== undefined) {
            parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid dueDate format. Must be a valid ISO date string.' },
                    { status: 400 }
                );
            }
        }

        const updated = await updatePregnancy(pregnancyId, {
            babyNickname,
            dueDate: parsedDueDate,
            status,
        });

        // Handle side-effects of status transitions
        if (status === 'completed') {
            // Flip user phase to post_delivery, keep pregnancyId for history
            await auth.api.updateUser({
                body: { phase: 'post_delivery' },
                headers: request.headers,
            });
        } else if (status === 'miscarried') {
            // Clear pregnancyId from user record
            // await auth.api.updateUser({
            //     body: { pregnancyId: '' },
            //     headers: request.headers,
            // });
        }

        return NextResponse.json({ success: true, pregnancy: updated });
    } catch (error) {
        console.error('Update Pregnancy Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to update pregnancy record.', details: errorMessage },
            { status: 500 }
        );
    }
}

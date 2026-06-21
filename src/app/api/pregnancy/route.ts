import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    createPregnancy,
    // getActivePregnancyByUserId,
    getPregnancy,
    type CalculationMethod,
    type PregnancyType,
} from '@/services/pregnancy-service';

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return new Response('Unauthorized', { status: 401 });
        }

        const userId = session.user.id;

        const data = await request.json();
        const {
            dueDate,
            lmpDate,
            cycleLengthDays,
            babyNickname,
            pregnancyType,
        } = data;

        if (!dueDate && !lmpDate) {
            return NextResponse.json(
                { error: 'Either dueDate or lmpDate is required.' },
                { status: 400 }
            );
        }

        let parsedDueDate: Date;
        let calculationMethod: CalculationMethod;

        if (dueDate) {
            parsedDueDate = new Date(dueDate);
            if (isNaN(parsedDueDate.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid dueDate format. Must be a valid ISO date string.' },
                    { status: 400 }
                );
            }
            calculationMethod = 'dueDate';
        } else {
            // Calculate due date from LMP: 280 days + cycle length adjustment (default cycle = 28 days)
            const parsedLmpDate = new Date(lmpDate);
            if (isNaN(parsedLmpDate.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid lmpDate format. Must be a valid ISO date string.' },
                    { status: 400 }
                );
            }
            const cycleAdjustment = cycleLengthDays ? Number(cycleLengthDays) - 28 : 0;
            parsedDueDate = new Date(parsedLmpDate);
            parsedDueDate.setDate(parsedDueDate.getDate() + 280 + cycleAdjustment);
            calculationMethod = 'lmp';
        }

        const validTypes: PregnancyType[] = ['singleton', 'twins', 'triplets', 'other'];
        if (pregnancyType && !validTypes.includes(pregnancyType)) {
            return NextResponse.json(
                { error: `Invalid pregnancyType. Must be one of: ${validTypes.join(', ')}.` },
                { status: 400 }
            );
        }

        const pregnancyId = await createPregnancy({
            userId,
            dueDate: parsedDueDate,
            calculationMethod,
            lmpDate: lmpDate ? new Date(lmpDate) : undefined,
            cycleLengthDays: cycleLengthDays ? Number(cycleLengthDays) : undefined,
            babyNickname: babyNickname ?? undefined,
            pregnancyType: pregnancyType as PregnancyType | undefined,
        });

        // Store pregnancyId on the user record
        await auth.api.updateUser({
            body: { pregnancyId },
            headers: request.headers,
        });

        const pregnancy = await getPregnancy(pregnancyId);

        return NextResponse.json(
            { success: true, pregnancyId, pregnancy },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create Pregnancy Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to create pregnancy record.', details: errorMessage },
            { status: 500 }
        );
    }
}

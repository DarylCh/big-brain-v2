import { NextRequest, NextResponse } from 'next/server';
import { getAnswers, submitAnswers, save } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerid: string }> }
) {
  try {
    const { playerid } = await params;
    console.log(`Retrieving answer IDs for player ${playerid}`);
    const answerIds = getAnswers(playerid);
    console.log('Retrieved answer IDs: ', answerIds);
    return NextResponse.json({ answerIds });
  } catch (error: unknown) {
    console.error('Error in retrieving answer IDs:', error);
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ playerid: string }> }
) {
  try {
    const { answerIds } = await request.json();
    const { playerid } = await params;
    await submitAnswers(playerid, answerIds);
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

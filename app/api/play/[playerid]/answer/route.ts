import { NextRequest, NextResponse } from 'next/server';
import { getAnswers, submitAnswers, save } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerid: string } }
) {
  try {
    const answerIds = await getAnswers(params.playerid);
    return NextResponse.json({ answerIds });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { playerid: string } }
) {
  try {
    const { answerIds } = await request.json();
    await submitAnswers(params.playerid, answerIds);
    await save();
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

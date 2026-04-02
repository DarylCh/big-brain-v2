import { NextRequest, NextResponse } from 'next/server';
import {
  hasStarted,
  getQuestion,
  getAnswers,
  submitAnswers,
  getResults,
} from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerid: string }> }
) {
  // Determine which endpoint based on the URL
  const url = request.nextUrl.pathname;

  try {
    const { playerid } = await params;
    if (url.includes('/status')) {
      const started = hasStarted(playerid);
      return NextResponse.json({ started });
    } else if (url.includes('/question')) {
      const question = getQuestion(playerid);
      return NextResponse.json({ question });
    } else if (url.includes('/answer')) {
      const answerIds = getAnswers(playerid);
      return NextResponse.json({ answerIds });
    } else if (url.includes('/results')) {
      const result = getResults(playerid);
      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    console.error('Error in GET /api/play/[playerid]:', error);
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
    console.error('Error in PUT /api/play/[playerid]:', error);
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

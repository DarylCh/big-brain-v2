import { NextRequest, NextResponse } from 'next/server';
import { hasStarted, getQuestion, getAnswers, submitAnswers, getResults, save } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerid: string } }
) {
  // Determine which endpoint based on the URL
  const url = request.nextUrl.pathname;
  
  try {
    if (url.includes('/status')) {
      const started = await hasStarted(params.playerid);
      return NextResponse.json({ started });
    } else if (url.includes('/question')) {
      const question = await getQuestion(params.playerid);
      return NextResponse.json({ question });
    } else if (url.includes('/answer')) {
      const answerIds = await getAnswers(params.playerid);
      return NextResponse.json({ answerIds });
    } else if (url.includes('/results')) {
      const result = await getResults(params.playerid);
      return NextResponse.json(result);
    }
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

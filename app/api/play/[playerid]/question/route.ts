import { NextRequest, NextResponse } from 'next/server';
import { getQuestion } from '@/app/lib/service';
import { PublicQuestion } from '@/app/lib/types';

export type PublicQuestionReturn = PublicQuestion & {
  isoTimeLastQuestionStarted: string | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerid: string }> }
) {
  try {
    const { playerid } = await params;
    const question = await getQuestion(playerid);
    console.log('Retrieved question for player ', playerid, ': ', question);
    return NextResponse.json(
      { question },
      { headers: { 'Cache-Control': 'no-store' } }
    );
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

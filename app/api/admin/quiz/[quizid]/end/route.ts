import { NextRequest, NextResponse } from 'next/server';
import { endQuiz, assertOwnsQuiz, getEmailFromAuthorization, save } from '@/app/lib/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { quizid: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 403 });
    }
    const email = getEmailFromAuthorization(authHeader);
    await assertOwnsQuiz(email, params.quizid);
    await endQuiz(params.quizid);
    await save();
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

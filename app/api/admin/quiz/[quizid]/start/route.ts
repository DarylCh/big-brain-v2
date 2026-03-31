import { NextRequest, NextResponse } from 'next/server';
import {
  startQuiz,
  assertOwnsQuiz,
  getEmailFromAuthorization,
  save,
} from '@/app/lib/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const email = getEmailFromAuthorization(authHeader);
    const { quizid: quizId } = await params;
    assertOwnsQuiz(email, quizId);
    await startQuiz(quizId);
    return NextResponse.json({});
  } catch (error: unknown) {
    console.error('Error in POST /api/admin/quiz/[quizid]/start: ', error);
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

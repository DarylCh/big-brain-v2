import { NextRequest, NextResponse } from 'next/server';
import {
  assertOwnsQuiz,
  updateQuestion,
  removeQuestion,
  getUserIdFromAuthorization,
} from '@/app/lib/service';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizid: string; questionid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const { quizid: quizId, questionid: questionId } = await params;
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const userId = getUserIdFromAuthorization(authHeader);
    await assertOwnsQuiz(userId, quizId);
    const { question, options, correct, timeNeededMs } = await request.json();
    const id = await updateQuestion(
      questionId,
      quizId,
      question,
      options,
      correct,
      timeNeededMs
    );
    return NextResponse.json({ id });
  } catch (error: unknown) {
    console.error(
      'Error in PUT /api/admin/quiz/[quizid]/question/[questionid]:',
      error
    );
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'A system error occurred',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizid: string; questionid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const { quizid: quizId, questionid: questionId } = await params;
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const userId = getUserIdFromAuthorization(authHeader);
    await assertOwnsQuiz(userId, quizId);
    await removeQuestion(questionId, quizId);
    return NextResponse.json({});
  } catch (error: unknown) {
    console.error(
      'Error in DELETE /api/admin/quiz/[quizid]/question/[questionid]:',
      error
    );
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'A system error occurred',
      },
      { status: 500 }
    );
  }
}

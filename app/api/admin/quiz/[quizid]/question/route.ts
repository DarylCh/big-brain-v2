import { NextRequest, NextResponse } from 'next/server';
import {
  assertOwnsQuiz,
  getQuestions,
  addQuestions,
  getUserIdFromAuthorization,
} from '@/app/lib/service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const { quizid: quizId } = await params;
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const userId = getUserIdFromAuthorization(authHeader);
    await assertOwnsQuiz(userId, quizId);
    const questions = await getQuestions(quizId);
    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error('Error in GET /api/admin/quiz/[quizid]/question:', error);
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const { quizid: quizId } = await params;
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const userId = getUserIdFromAuthorization(authHeader);
    await assertOwnsQuiz(userId, quizId);
    const { questions } = await request.json();
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'questions must be a non-empty array' },
        { status: 400 }
      );
    }
    const ids = await addQuestions(quizId, questions);
    return NextResponse.json({ ids }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/admin/quiz/[quizid]/question:', error);
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

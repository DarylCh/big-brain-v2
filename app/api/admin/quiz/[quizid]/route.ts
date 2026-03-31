import { NextRequest, NextResponse } from 'next/server';
import {
  getQuiz,
  updateQuiz,
  removeQuiz,
  assertOwnsQuiz,
  getEmailFromAuthorization,
} from '@/app/lib/service';
import { Question } from '@/app/lib/types';

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
    const email = getEmailFromAuthorization(authHeader);
    assertOwnsQuiz(email, quizId);
    const quiz = getQuiz(quizId);
    return NextResponse.json(quiz);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const email = getEmailFromAuthorization(authHeader);
    assertOwnsQuiz(email, quizId);

    const { questions, name, thumbnail } = await request.json();
    await updateQuiz(quizId, questions, name, thumbnail);
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const email = getEmailFromAuthorization(authHeader);
    assertOwnsQuiz(email, quizId);
    await removeQuiz(quizId);
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getQuiz, updateQuiz, removeQuiz, assertOwnsQuiz, getEmailFromAuthorization, save } from '@/app/lib/service';

export async function GET(
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
    const quiz = await getQuiz(params.quizid);
    return NextResponse.json(quiz);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

export async function PUT(
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
    
    const { questions, name, thumbnail } = await request.json();
    await updateQuiz(params.quizid, questions, name, thumbnail);
    await save();
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

export async function DELETE(
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
    await removeQuiz(params.quizid);
    await save();
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

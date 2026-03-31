import { NextRequest, NextResponse } from 'next/server';
import {
  getQuizzesFromAdmin,
  addQuiz,
  getEmailFromAuthorization,
  save,
} from '@/app/lib/service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('authHeader: ', authHeader);
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const email = getEmailFromAuthorization(authHeader);
    const quizzes = getQuizzesFromAdmin(email);
    return NextResponse.json({ quizzes });
  } catch (error: unknown) {
    console.error('Error in GET /api/admin/quiz: ', error);
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const email = getEmailFromAuthorization(authHeader);
    const { name } = await request.json();
    const quizId = await addQuiz(name, email);
    return NextResponse.json({ quizId });
  } catch (error: unknown) {
    console.error('Error in POST /api/admin/quiz: ', error);
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

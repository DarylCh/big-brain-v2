import { NextRequest, NextResponse } from 'next/server';
import { getQuizzesFromAdmin, addQuiz, getEmailFromAuthorization, save } from '@/app/lib/service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 403 });
    }
    const email = getEmailFromAuthorization(authHeader);
    const quizzes = await getQuizzesFromAdmin(email);
    return NextResponse.json({ quizzes });
  } catch (error: unknown) {
    if (error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 403 });
    }
    const email = getEmailFromAuthorization(authHeader);
    const { name } = await request.json();
    const quizId = await addQuiz(name, email);
    await save();
    return NextResponse.json({ quizId });
  } catch (error: unknown) {
    if (error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/app/lib/service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const token = await login(email, password);
    return NextResponse.json({ token });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

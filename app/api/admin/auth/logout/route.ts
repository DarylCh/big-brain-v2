import { NextRequest, NextResponse } from 'next/server';
import { logout, getEmailFromAuthorization } from '@/app/lib/service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 403 });
    }
    const email = getEmailFromAuthorization(authHeader);
    await logout(email);
    return NextResponse.json({});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

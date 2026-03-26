import { NextRequest, NextResponse } from 'next/server';
import { sessionResults, assertOwnsSession, getEmailFromAuthorization } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionid: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 403 });
    }
    const email = getEmailFromAuthorization(authHeader);
    await assertOwnsSession(email, params.sessionid);
    const results = await sessionResults(params.sessionid);
    return NextResponse.json({ results });
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

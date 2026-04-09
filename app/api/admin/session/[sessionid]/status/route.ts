import { NextRequest, NextResponse } from 'next/server';
import { sessionStatus, getUserIdFromAuthorization } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const userId = getUserIdFromAuthorization(authHeader);
    const { sessionid: sessionId } = await params;
    const results = await sessionStatus(sessionId, userId);

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error(
      'Error in GET /api/admin/session/[sessionid]/status: ',
      error
    );
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

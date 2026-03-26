import { NextRequest, NextResponse } from 'next/server';
import { playerJoin, save } from '@/app/lib/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionid: string } }
) {
  try {
    const { name } = await request.json();
    const playerId = await playerJoin(name, params.sessionid);
    await save();
    return NextResponse.json({ playerId });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

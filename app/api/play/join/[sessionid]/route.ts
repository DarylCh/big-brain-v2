import { NextRequest, NextResponse } from 'next/server';
import { playerJoin } from '@/app/lib/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionid: string }> }
) {
  try {
    const { name } = await request.json();
    const { sessionid } = await params;
    console.log(`Player ${name} is attempting to join session ${sessionid}`);

    const playerId = await playerJoin(name, sessionid);
    console.log(
      `Player ${name} successfully joined session ${sessionid} with ID ${playerId}`
    );

    return NextResponse.json({ playerId });
  } catch (error: unknown) {
    console.error('Error in player join:', error);
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

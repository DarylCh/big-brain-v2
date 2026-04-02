import { NextRequest, NextResponse } from 'next/server';
import { hasStarted } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerid: string }> }
) {
  try {
    const { playerid } = await params;
    const started = hasStarted(playerid);
    return NextResponse.json(
      { started },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: unknown) {
    console.error('Error in retrieving player status:', error);
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

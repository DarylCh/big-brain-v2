import { NextRequest, NextResponse } from 'next/server';
import { getResults } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerid: string }> }
) {
  try {
    const { playerid } = await params;
    const result = getResults(playerid);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error in GET /api/play/[playerid]/results:', error);
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'A system error occurred' },
      { status: 500 }
    );
  }
}

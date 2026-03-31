import { NextRequest, NextResponse } from 'next/server';
import { getResults } from '@/app/lib/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerid: string } }
) {
  try {
    const result = getResults(params.playerid);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'InputError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'A system error occurred' }, { status: 500 });
  }
}

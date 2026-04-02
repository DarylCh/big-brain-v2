import { NextResponse } from 'next/server';
import { reset } from '@/app/lib/service';

export async function DELETE() {
  try {
    await reset();
    return NextResponse.json({});
  } catch (error: unknown) {
    console.error('Error in DELETE /api/admin/delete:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'A system error occurred',
      },
      { status: 500 }
    );
  }
}

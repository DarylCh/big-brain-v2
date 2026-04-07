import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import {
  assertOwnsQuiz,
  getUserIdFromAuthorization,
  updateQuiz,
} from '@/app/lib/service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizid: string }> }
) {
  try {
    const { quizid: quizId } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 403 }
      );
    }
    const userId = getUserIdFromAuthorization(authHeader);
    await assertOwnsQuiz(userId, quizId);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be an image (jpeg, png, gif, webp)' },
        { status: 400 }
      );
    }

    const blob = await put(`quiz-thumbnails/${quizId}/${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    });

    await updateQuiz(quizId, undefined, undefined, blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (error: unknown) {
    console.error('Error uploading thumbnail:', error);
    if (error instanceof Error && error.name === 'AccessError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

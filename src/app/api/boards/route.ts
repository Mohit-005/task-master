export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadDb, saveDb } from '@/lib/store';

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const db = await loadDb();
  const boards = db.boards.filter(b => b.userId === session.user.id);
  return NextResponse.json({ boards });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ message: 'Board name is required' }, { status: 400 });
  }

  const newBoard = {
    id: `board-${Date.now()}`,
    name,
    userId: session.user.id,
  };

  const db = await loadDb();
  db.boards.push(newBoard);
  await saveDb(db);
  return NextResponse.json(newBoard, { status: 201 });
}

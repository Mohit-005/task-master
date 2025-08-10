export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadDb, saveDb } from '@/lib/store';
import { z } from 'zod';

const boardPatchSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(50),
});

export async function PATCH(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const boardId = params.boardId;
  const db = loadDb();
  const boardIndex = db.boards.findIndex(b => b.id === boardId);
  
  if (boardIndex === -1) {
    return NextResponse.json({ message: 'Board not found' }, { status: 404 });
  }
  
  const board = db.boards[boardIndex];
  if (board.userId !== session.user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const json = await request.json();
  const parsed = boardPatchSchema.safeParse(json);

  if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsed.error.errors }, { status: 400 });
  }

  const updatedBoard = { ...board, name: parsed.data.name };
  db.boards[boardIndex] = updatedBoard;
  saveDb(db);

  return NextResponse.json(updatedBoard, { status: 200 });
}


export async function DELETE(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const boardId = params.boardId;
  const db = loadDb();
  const boardIndex = db.boards.findIndex(b => b.id === boardId);
  
  if (boardIndex === -1) {
    return NextResponse.json({ message: 'Board not found' }, { status: 404 });
  }
  
  const board = db.boards[boardIndex];
  if (board.userId !== session.user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  db.boards.splice(boardIndex, 1);
  db.tasks = db.tasks.filter(t => t.boardId !== boardId);
  saveDb(db);

  return NextResponse.json({ message: 'Board deleted successfully' });
}

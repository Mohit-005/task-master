export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadDb, saveDb } from '@/lib/store';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  boardId: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Only return tasks from boards owned by the user
  const db = await loadDb();
  const userBoardIds = new Set(db.boards.filter(b => b.userId === session.user.id).map(b => b.id));
  const tasks = db.tasks.filter(t => userBoardIds.has(t.boardId));
  
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = taskSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid task data', errors: parsed.error.errors }, { status: 400 });
  }
  
  const { boardId, ...taskData } = parsed.data;

  let db = await loadDb();
  let board = db.boards.find(b => b.id === boardId);
  if (!board || board.userId !== session.user.id) {
    // Retry once in case of eventual consistency on Blob
    db = await loadDb();
    board = db.boards.find(b => b.id === boardId);
    if (!board || board.userId !== session.user.id) {
      return NextResponse.json({ message: 'Board not found or you do not have permission' }, { status: 403 });
    }
  }
  
  const newTask = {
    id: `task-${Date.now()}`,
    ...taskData,
    boardId,
    userId: session.user.id,
    dueDate: taskData.dueDate || null,
    tags: taskData.tags || [],
    description: taskData.description || '',
  };

  const db2 = await loadDb();
  db2.tasks.push(newTask);
  await saveDb(db2);
  return NextResponse.json(newTask, { status: 201 });
}
